import { ErrorConstant } from '@remirror/core-constants';
import {
  assertGet,
  entries,
  invariant,
  isFunction,
  isPromise,
  isString,
} from '@remirror/core-helpers';
import type {
  AttributesProps,
  CommandFunction,
  CommandFunctionProps,
  EditorSchema,
  FromToProps,
  MarkType,
  MarkTypeProps,
  PrimitiveSelection,
  ProsemirrorAttributes,
  ProsemirrorNode,
} from '@remirror/core-types';
import { convertCommand, getCursor, getTextSelection, isMarkActive } from '@remirror/core-utils';
import { toggleMark as originalToggleMark } from '@remirror/pm/commands';
import type { SelectionRange } from '@remirror/pm/state';

/**
 * The parameter that is passed into `DelayedCommand`s.
 */
interface DelayedCommandProps<Value> {
  /**
   * Runs as soon as the command is triggered. For most delayed commands within
   * the `remirror` codebase this is used to add a position tracker to the
   * document.
   */
  immediate?: CommandFunction;

  /**
   * The promise that provides the value that the `onDone` callback uses to
   * complete the delayed command.
   */
  promise: DelayedValue<Value>;

  /**
   * Called when the provided promise resolves.
   */
  onDone: CommandFunction<EditorSchema, { value: Value }>;

  /**
   * Called when the promise fails. This could be used to cleanup the active
   * position trackers when the delayed command fails.
   */
  onFail?: CommandFunction;
}

export type DelayedValue<Type> = Promise<Type> | (() => Promise<Type>);

/**
 * Returns `true` when the provided value is a delayed value.
 */
export function isDelayedValue<Type>(value: unknown): value is DelayedValue<Type> {
  return isFunction(value) || isPromise(value);
}

/**
 * Add tentative support for delayed commands in the editor.
 *
 * Delayed commands are commands that run an immediate action, like adding a
 * tracker to a position in the document. Once the promise that is provided is
 * returned the `onDone` parameter is run with the document in the current
 * state. The tracker that was added can now be used to insert content, delete
 * content or replace content.
 *
 * @experimental This is still being worked on and the API is subject to changes
 * in structure going forward.
 *
 * @deprecated use [[`DelayedCommand`]] instead.
 *
 */
export function delayedCommand<Value>({
  immediate,
  promise,
  onDone,
  onFail,
}: DelayedCommandProps<Value>): CommandFunction {
  return (props) => {
    const { view } = props;

    if (immediate?.(props) === false) {
      return false;
    }

    if (!view) {
      return true;
    }

    const deferred = isFunction(promise) ? promise() : promise;

    deferred
      .then((value) => {
        // Run the command
        onDone({ state: view.state, tr: view.state.tr, dispatch: view.dispatch, view, value });
      })
      .catch(() => {
        // Run the failure command if it exists.
        onFail?.({ state: view.state, tr: view.state.tr, dispatch: view.dispatch, view });
      });

    return true;
  };
}

export type DelayedPromiseCreator<Value> = (props: CommandFunctionProps) => Promise<Value>;

export class DelayedCommand<Value> {
  private readonly failureHandlers: Array<CommandFunction<EditorSchema, { error: any }>> = [];
  private readonly successHandlers: Array<CommandFunction<EditorSchema, { value: Value }>> = [];
  private readonly validateHandlers: CommandFunction[] = [];

  constructor(private readonly promiseCreator: DelayedPromiseCreator<Value>) {}

  /**
   * The commands that will immediately be run and used to evaluate whether to
   * proceed.
   */
  validate(handler: CommandFunction, method: 'push' | 'unshift' = 'push'): this {
    this.validateHandlers[method](handler);
    return this;
  }

  /**
   * Add a success callback to the handler.
   */
  success(
    handler: CommandFunction<EditorSchema, { value: Value }>,
    method: 'push' | 'unshift' = 'push',
  ): this {
    this.successHandlers[method](handler);
    return this;
  }

  /**
   * Add a failure callback to the handler.
   */
  failure(
    handler: CommandFunction<EditorSchema, { error: any }>,
    method: 'push' | 'unshift' = 'push',
  ): this {
    this.failureHandlers[method](handler);
    return this;
  }

  private runHandlers<Param extends CommandFunctionProps>(
    handlers: Array<(params: Param) => boolean>,
    param: Param,
  ): void {
    for (const handler of handlers) {
      if (!handler({ ...param, dispatch: () => {} })) {
        break;
      }
    }

    param.dispatch?.(param.tr);
  }

  /**
   * Generate the `remirror` command.
   */
  readonly generateCommand = (): CommandFunction => {
    return (props) => {
      let isValid = true;
      const { view, tr, dispatch } = props;

      if (!view) {
        return false;
      }

      for (const handler of this.validateHandlers) {
        if (!handler({ ...props, dispatch: () => {} })) {
          isValid = false;
          break;
        }
      }

      if (!dispatch || !isValid) {
        return isValid;
      }

      // Start the promise.
      const deferred = this.promiseCreator(props);

      deferred
        .then((value) => {
          this.runHandlers(this.successHandlers, {
            value,
            state: view.state,
            tr: view.state.tr,
            dispatch: view.dispatch,
            view,
          });
        })
        .catch((error) => {
          this.runHandlers(this.failureHandlers, {
            error,
            state: view.state,
            tr: view.state.tr,
            dispatch: view.dispatch,
            view,
          });
        });

      dispatch(tr);
      return true;
    };
  };
}

export interface ToggleMarkProps<Schema extends EditorSchema = EditorSchema>
  extends MarkTypeProps<Schema>,
    Partial<AttributesProps> {
  /**
   * @deprecated use `selection` property instead.
   */
  range?: FromToProps;

  /**
   * The selection point for toggling the chosen mark.
   */
  selection?: PrimitiveSelection;
}

/**
 * A custom `toggleMark` function that works for the `remirror` codebase.
 *
 * Create a command function that toggles the given mark with the given
 * attributes. Will return `false` when the current selection doesn't support
 * that mark. This will remove the mark if any marks of that type exist in the
 * selection, or add it otherwise. If the selection is empty, this applies to
 * the [stored marks](#state.EditorState.storedMarks) instead of a range of the
 * document.
 *
 * The differences from the `prosemirror-commands` version.
 * - Acts on the transaction rather than the state to allow for commands to be
 *   chained together.
 * - Uses the ONE parameter function signature for compatibility with remirror.
 * - Supports passing a custom range.
 */
export function toggleMark(props: ToggleMarkProps): CommandFunction {
  const { type, attrs, range, selection } = props;

  return (props) => {
    const { dispatch, tr, state } = props;
    const markType = isString(type) ? state.schema.marks[type] : type;

    invariant(markType, {
      code: ErrorConstant.SCHEMA,
      message: `Mark type: ${type} does not exist on the current schema.`,
    });

    if (range || selection) {
      const { from, to } = getTextSelection(selection ?? range ?? tr.selection, tr.doc);
      isMarkActive({ trState: tr, type, ...range })
        ? dispatch?.(tr.removeMark(from, to, markType))
        : dispatch?.(tr.addMark(from, to, markType.create(attrs)));

      return true;
    }

    return convertCommand(originalToggleMark(markType, attrs))(props);
  };
}

/**
 * Verifies that the mark type can be applied to the current document.
 */
function markApplies(type: MarkType, doc: ProsemirrorNode, ranges: SelectionRange[]) {
  for (const { $from, $to } of ranges) {
    let markIsAllowed = $from.depth === 0 ? doc.type.allowsMarkType(type) : false;

    doc.nodesBetween($from.pos, $to.pos, (node) => {
      if (markIsAllowed) {
        // This prevents diving deeper into child nodes.
        return false;
      }

      markIsAllowed = node.inlineContent && node.type.allowsMarkType(type);
      return;
    });

    if (markIsAllowed) {
      return true;
    }
  }

  return false;
}

/**
 * Apply the provided mark type and attributes.
 *
 * @param markType - the mark to apply.
 * @param attrs - the attributes to set on the applied mark.
 * @param selectionPoint - optionally specify where the mark should be applied.
 * Defaults to the current selection.
 */
export function applyMark(
  type: string | MarkType,
  attrs?: ProsemirrorAttributes,
  selectionPoint?: PrimitiveSelection,
): CommandFunction {
  return ({ tr, dispatch, state }) => {
    const selection = getTextSelection(selectionPoint ?? tr.selection, tr.doc);
    const $cursor = getCursor(selection);

    const markType = isString(type) ? state.schema.marks[type] : type;

    invariant(markType, {
      code: ErrorConstant.SCHEMA,
      message: `Mark type: ${type} does not exist on the current schema.`,
    });

    if ((selection.empty && !$cursor) || !markApplies(markType, tr.doc, selection.ranges)) {
      return false;
    }

    if (!dispatch) {
      return true;
    }

    if ($cursor) {
      tr.removeStoredMark(markType);

      if (attrs) {
        tr.addStoredMark(markType.create(attrs));
      }

      dispatch(tr);
      return true;
    }

    let containsMark = false;

    for (const { $from, $to } of selection.ranges) {
      if (containsMark) {
        break;
      }

      containsMark = tr.doc.rangeHasMark($from.pos, $to.pos, markType);
    }

    for (const { $from, $to } of selection.ranges) {
      if (containsMark) {
        tr.removeMark($from.pos, $to.pos, markType);
      }

      if (attrs) {
        tr.addMark($from.pos, $to.pos, markType.create(attrs));
      }
    }

    dispatch(tr);

    return true;
  };
}

export interface InsertTextOptions extends Partial<FromToProps> {
  /**
   * Marks can be added to the inserted text.
   */
  marks?: Record<string, ProsemirrorAttributes>;
}

/**
 * Insert text into the dom at the current location by default. If a promise is
 * provided then the text will be inserted at the tracked position when the
 * promise is resolved.
 */
export function insertText(text: string, options: InsertTextOptions = {}): CommandFunction {
  return ({ tr, dispatch, state }) => {
    const schema = state.schema;
    const selection = tr.selection;
    const { from = selection.from, to = from ?? selection.to, marks = {} } = options;

    if (!dispatch) {
      return true;
    }

    // Insert the text
    tr.insertText(text, from, to);

    // Map the end position after inserting the text to understand what needs to
    // be wrapped with a mark.
    const end = assertGet(tr.steps, tr.steps.length - 1)
      .getMap()
      .map(to);

    // Loop through the provided marks to add the mark to the selection. This
    // uses the order of the map you created. If any marks are exclusive, they
    // will override the previous.
    for (const [markName, attributes] of entries(marks)) {
      tr.addMark(from, end, assertGet(schema.marks, markName).create(attributes));
    }

    dispatch(tr);

    return true;
  };
}
