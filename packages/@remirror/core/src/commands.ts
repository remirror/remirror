import { entries, isFunction, isPromise } from '@remirror/core-helpers';
import type {
  AttributesParameter,
  CommandFunction,
  EditorSchema,
  FromToParameter,
  MarkAttributes,
  MarkTypeParameter,
  RangeParameter,
} from '@remirror/core-types';
import { convertCommand, isMarkActive } from '@remirror/core-utils';
import { toggleMark as originalToggleMark } from '@remirror/pm/commands';

/**
 * The parameter that is passed into `DelayedCommand`s.
 */
interface DelayedCommandParameter<Value> {
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
 */
export function delayedCommand<Value>({
  immediate,
  promise,
  onDone,
  onFail,
}: DelayedCommandParameter<Value>): CommandFunction {
  return (parameter) => {
    const { view } = parameter;

    if (immediate?.(parameter) === false) {
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

export interface ToggleMarkParameter<Schema extends EditorSchema = EditorSchema>
  extends MarkTypeParameter<Schema>,
    Partial<AttributesParameter>,
    Partial<RangeParameter> {}

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
export function toggleMark(parameter: ToggleMarkParameter): CommandFunction {
  const { type, attrs, range } = parameter;

  return (parameter) => {
    const { dispatch, tr } = parameter;

    if (range) {
      isMarkActive({ trState: tr, type, ...range })
        ? dispatch?.(tr.removeMark(range.from, range.to, type))
        : dispatch?.(tr.addMark(range.from, range.to, type.create(attrs)));

      return true;
    }

    return convertCommand(originalToggleMark(type, attrs))(parameter);
  };
}

export interface InsertTextOptions extends Partial<FromToParameter> {
  /**
   * Marks can be added to the inserted text.
   */
  marks?: Record<string, MarkAttributes>;
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
    const end = tr.steps[tr.steps.length - 1].getMap().map(to);

    // Loop through the provided marks to add the mark to the selection. This
    // uses the order of the map you created. If any marks are exclusive, they
    // will override the previous.
    for (const [markName, attributes] of entries(marks)) {
      tr.addMark(from, end, schema.marks[markName].create(attributes));
    }

    dispatch(tr);

    return true;
  };
}
