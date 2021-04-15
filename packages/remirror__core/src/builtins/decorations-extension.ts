import { ExtensionPriority } from '@remirror/core-constants';
import { isNumber, isString, uniqueArray, uniqueId } from '@remirror/core-helpers';
import type {
  AcceptUndefined,
  CommandFunction,
  CommandFunctionProps,
  EditorSchema,
  EditorState,
  EditorView,
  FromToProps,
  Handler,
  MakeRequired,
  Static,
  Transaction,
} from '@remirror/core-types';
import { findNodeAtPosition, isNodeSelection } from '@remirror/core-utils';
import { Decoration, DecorationSet, WidgetDecorationSpec } from '@remirror/pm/view';

import { DelayedCommand, DelayedPromiseCreator } from '../commands';
import { extension, Helper, PlainExtension } from '../extension';
import type { CreateExtensionPlugin } from '../types';
import { command, helper } from './builtin-decorators';

export interface DecorationsOptions {
  /**
   * This setting is for adding a decoration to the selected text and can be
   * used to preserve the marker for the selection when the editor loses focus.
   *
   * @default undefined
   */
  persistentSelectionClass?: AcceptUndefined<string | boolean>;

  /**
   * Add custom decorations to the editor via `extension.addHandler`. This can
   * be used via the `useDecorations` hook available from `remirror/react`.
   */
  decorations: Handler<(state: EditorState) => DecorationSet>;

  /**
   * The className that is added to all placeholder positions
   *
   * '@default 'placeholder'
   */
  placeholderClassName?: Static<string>;

  /**
   * The default element that is used for all placeholders.
   *
   * @default 'span'
   */
  placeholderNodeName?: Static<string>;
}

/**
 * Simplify the process of adding decorations to the editor. All the decorations
 * added to the document this way are automatically tracked which allows for
 * custom components to be nested inside decorations.
 *
 * @category Builtin Extension
 */
@extension<DecorationsOptions>({
  defaultOptions: {
    persistentSelectionClass: 'selection',
    placeholderClassName: 'placeholder',
    placeholderNodeName: 'span',
  },
  staticKeys: ['placeholderClassName', 'placeholderNodeName'],
  handlerKeys: ['decorations'],
  handlerKeyOptions: {
    decorations: {
      reducer: {
        accumulator: (accumulated, latestValue, state) => {
          return accumulated.add(state.doc, latestValue.find());
        },
        getDefault: () => DecorationSet.empty,
      },
    },
  },
  defaultPriority: ExtensionPriority.Low,
})
export class DecorationsExtension extends PlainExtension<DecorationsOptions> {
  get name() {
    return 'decorations' as const;
  }

  /**
   * The placeholder decorations.
   */
  private placeholders = DecorationSet.empty;

  /**
   * A map of the html elements to their decorations.
   */
  private readonly placeholderWidgets = new Map<
    unknown,
    Decoration<
      WidgetDecorationSpec &
        Pick<WidgetPlaceholder, 'onDestroy' | 'onUpdate' | 'data'> & { element: HTMLElement }
    >
  >();

  onCreate(): void {
    this.store.setExtensionStore('createPlaceholderCommand', this.createPlaceholderCommand);
  }

  /**
   * Create the extension plugin for inserting decorations into the editor.
   */
  createPlugin(): CreateExtensionPlugin {
    return {
      state: {
        init: () => {},
        apply: (tr) => {
          // Get tracker updates from the meta data
          const { added, clearTrackers, removed, updated } = this.getMeta(tr);

          if (clearTrackers) {
            this.placeholders = DecorationSet.empty;

            for (const [, widget] of this.placeholderWidgets) {
              widget.spec.onDestroy?.(this.store.view, widget.spec.element);
            }

            this.placeholderWidgets.clear();
            return;
          }

          this.placeholders = this.placeholders.map(tr.mapping, tr.doc, {
            onRemove: (spec) => {
              // Remove any removed widgets.
              const widget = this.placeholderWidgets.get(spec.id);

              if (widget) {
                widget.spec.onDestroy?.(this.store.view, widget.spec.element);
              }
            },
          });

          for (const [, widget] of this.placeholderWidgets) {
            widget.spec.onUpdate?.(
              this.store.view,
              widget.from,
              widget.spec.element,
              widget.spec.data,
            );
          }

          // Update the decorations with any added position trackers.
          for (const placeholder of added) {
            if (placeholder.type === 'inline') {
              this.addInlinePlaceholder(placeholder as WithBase<InlinePlaceholder>, tr);
              continue;
            }

            if (placeholder.type === 'node') {
              this.addNodePlaceholder(placeholder as WithBase<NodePlaceholder>, tr);
              continue;
            }

            if (placeholder.type === 'widget') {
              this.addWidgetPlaceholder(placeholder as WithBase<WidgetPlaceholder>, tr);
              continue;
            }
          }

          for (const { id, data } of updated) {
            const widget = this.placeholderWidgets.get(id);

            // Only support updating widget decorations.
            if (!widget) {
              continue;
            }

            const updatedWidget = Decoration.widget(widget.from, widget.spec.element, {
              ...widget.spec,
              data,
            });

            this.placeholders = this.placeholders.remove([widget]).add(tr.doc, [updatedWidget]);
            this.placeholderWidgets.set(id, updatedWidget);
          }

          for (const id of removed) {
            const found = this.placeholders.find(
              undefined,
              undefined,
              (spec) => spec.id === id && spec.__type === __type,
            );

            const widget = this.placeholderWidgets.get(id);

            if (widget) {
              widget.spec.onDestroy?.(this.store.view, widget.spec.element);
            }

            this.placeholders = this.placeholders.remove(found);
            this.placeholderWidgets.delete(id);
          }
        },
      },
      props: {
        decorations: (state) => {
          let decorationSet = this.options.decorations(state);
          decorationSet = decorationSet.add(state.doc, this.placeholders.find());

          for (const extension of this.store.extensions) {
            // Skip this extension when the method doesn't exist.
            if (!extension.createDecorations) {
              continue;
            }

            const decorations = extension.createDecorations(state).find();
            decorationSet = decorationSet.add(state.doc, decorations);
          }

          return decorationSet;
        },
      },
    };
  }

  @command()
  updateDecorations(): CommandFunction {
    return ({ tr, dispatch }) => (dispatch?.(tr), true);
  }

  /**
   * Command to dispatch a transaction adding the placeholder decoration to
   * be tracked.
   *
   * @param id - the value that is used to identify this tracker. This can
   * be any value. A promise, a function call, a string.
   * @param options - the options to call the tracked position with. You can
   * specify the range `{ from: number; to: number }` as well as the class
   * name.
   */
  @command()
  addPlaceholder(
    id: unknown,
    placeholder: DecorationPlaceholder,
    deleteSelection?: boolean,
  ): CommandFunction {
    return ({ dispatch, tr }) => {
      return this.addPlaceholderTransaction(id, placeholder, tr, !dispatch)
        ? (dispatch?.(deleteSelection ? tr.deleteSelection() : tr), true)
        : false;
    };
  }

  /**
   * A command to updated the placeholder decoration.
   *
   * To update multiple placeholders you can use chained commands.
   *
   * ```ts
   * let idsWithData: Array<{id: unknown, data: number}>;
   *
   * for (const { id, data } of idsWithData) {
   *   chain.updatePlaceholder(id, data);
   * }
   *
   * chain.run();
   * ```
   */
  @command()
  updatePlaceholder<Data = any>(id: unknown, data: Data): CommandFunction {
    return ({ dispatch, tr }) => {
      return this.updatePlaceholderTransaction({ id, data, tr, checkOnly: !dispatch })
        ? (dispatch?.(tr), true)
        : false;
    };
  }

  /**
   * A command to remove the specified placeholder decoration.
   */
  @command()
  removePlaceholder(id: unknown): CommandFunction {
    return ({ dispatch, tr }) => {
      return this.removePlaceholderTransaction({ id, tr, checkOnly: !dispatch })
        ? (dispatch?.(tr), true)
        : false;
    };
  }

  /**
   * A command to remove all active placeholder decorations.
   */
  @command()
  clearPlaceholders(): CommandFunction {
    return ({ tr, dispatch }) => {
      return this.clearPlaceholdersTransaction({ tr, checkOnly: !dispatch })
        ? (dispatch?.(tr), true)
        : false;
    };
  }

  /**
   * Find the position for the tracker with the ID specified.
   *
   * @param id - the unique position id which can be any type
   */
  @helper()
  findPlaceholder(id: unknown): Helper<FromToProps | undefined> {
    return this.findAllPlaceholders().get(id);
  }

  /**
   * Find the positions of all the trackers in document.
   */
  @helper()
  findAllPlaceholders(): Helper<Map<unknown, FromToProps>> {
    const trackers: Map<unknown, FromToProps> = new Map();
    const found = this.placeholders.find(undefined, undefined, (spec) => spec.__type === __type);

    for (const decoration of found) {
      trackers.set(decoration.spec.id, { from: decoration.from, to: decoration.to });
    }

    return trackers;
  }

  /**
   * Add some decorations based on the provided settings.
   */
  createDecorations(state: EditorState): DecorationSet {
    const { persistentSelectionClass } = this.options;

    // A container for the gathered decorations.
    let decorationSet = DecorationSet.empty;

    if (persistentSelectionClass && !this.store.helpers.isInteracting?.()) {
      // Add the selection decoration to the decorations array.
      decorationSet = generatePersistentSelectionDecorations(state, decorationSet, {
        class: isString(persistentSelectionClass) ? persistentSelectionClass : 'selection',
      });
    }

    return decorationSet;
  }

  /**
   * This stores all tracked positions in the editor and maps them via the
   * transaction updates.
   */
  onApplyState(): void {}

  /**
   * Add a widget placeholder and track it as a widget placeholder.
   */
  private addWidgetPlaceholder(placeholder: WithBase<WidgetPlaceholder>, tr: Transaction): void {
    const { pos, createElement, onDestroy, onUpdate, className, nodeName, id, type } = placeholder;

    const element = createElement?.(this.store.view, pos) ?? document.createElement(nodeName);
    element.classList.add(className);
    const decoration = Decoration.widget(pos, element, {
      id,
      __type,
      type,
      element,
      onDestroy,
      onUpdate,
    });

    this.placeholderWidgets.set(id, decoration);
    this.placeholders = this.placeholders.add(tr.doc, [decoration]);
  }

  /**
   * Add an inline placeholder.
   */
  private addInlinePlaceholder(placeholder: WithBase<InlinePlaceholder>, tr: Transaction): void {
    const {
      from = tr.selection.from,
      to = tr.selection.to,
      className,
      nodeName,
      id,
      type,
    } = placeholder;
    let decoration: Decoration;

    if (from === to) {
      // Add this as a widget if the range is empty.
      const element = document.createElement(nodeName);
      element.classList.add(className);
      decoration = Decoration.widget(from, element, { id, type, __type, widget: element });
    } else {
      // Make this span across nodes if the range is not empty.
      decoration = Decoration.inline(from, to, { nodeName, class: className }, { id, __type });
    }

    this.placeholders = this.placeholders.add(tr.doc, [decoration]);
  }

  /**
   * Add a placeholder for nodes.
   */
  private addNodePlaceholder(placeholder: WithBase<NodePlaceholder>, tr: Transaction): void {
    const { pos, className, nodeName, id } = placeholder;
    const $pos = isNumber(pos) ? tr.doc.resolve(pos) : tr.selection.$from;
    const found = isNumber(pos)
      ? $pos.nodeAfter
        ? { pos, end: $pos.nodeAfter.nodeSize }
        : undefined
      : findNodeAtPosition($pos);

    if (!found) {
      return;
    }

    const decoration = Decoration.node(
      found.pos,
      found.end,
      { nodeName, class: className },
      { id, __type },
    );
    this.placeholders = this.placeholders.add(tr.doc, [decoration]);
  }

  /**
   * Add the node and class name to the placeholder object.
   */
  private withRequiredBase<Type extends BasePlaceholder>(
    id: unknown,
    placeholder: Type,
  ): WithBase<Type> {
    const { placeholderNodeName, placeholderClassName } = this.options;
    const { nodeName = placeholderNodeName, className, ...rest } = placeholder;
    const classes = (className ? [placeholderClassName, className] : [placeholderClassName]).join(
      ' ',
    );

    return { nodeName, className: classes, ...rest, id };
  }

  /**
   * Get the command metadata.
   */
  private getMeta(tr: Transaction): Required<DecorationPlaceholderMeta> {
    const meta = tr.getMeta(this.pluginKey) ?? {};
    return { ...DEFAULT_PLACEHOLDER_META, ...meta };
  }

  /**
   * Set the metadata for the command.
   */
  private setMeta(tr: Transaction, update: DecorationPlaceholderMeta) {
    const meta = this.getMeta(tr);
    tr.setMeta(this.pluginKey, { ...meta, ...update });
  }

  /**
   * Add a placeholder decoration with the specified params to the transaction
   * and return the transaction.
   *
   * It is up to you to dispatch the transaction or you can just use the
   * commands.
   */
  private addPlaceholderTransaction(
    id: unknown,
    placeholder: DecorationPlaceholder,
    tr: Transaction,
    checkOnly = false,
  ): boolean {
    const existingPosition = this.findPlaceholder(id);

    if (existingPosition) {
      return false;
    }

    if (checkOnly) {
      return true;
    }

    const { added } = this.getMeta(tr);

    this.setMeta(tr, {
      added: [...added, this.withRequiredBase(id, placeholder)],
    });

    return true;
  }

  /**
   * Update the data stored by a placeholder.
   *
   * This replaces the whole data value.
   */
  private updatePlaceholderTransaction<Data = any>(props: {
    id: unknown;
    data: Data;
    tr: Transaction;
    checkOnly?: boolean;
  }): boolean {
    const { id, tr, checkOnly = false, data } = props;
    const existingPosition = this.findPlaceholder(id);

    if (!existingPosition) {
      return false;
    }

    if (checkOnly) {
      return true;
    }

    const { updated } = this.getMeta(tr);
    this.setMeta(tr, { updated: uniqueArray([...updated, { id, data }]) });

    return true;
  }

  /**
   * Discards a previously defined tracker once not needed.
   *
   * This should be used to cleanup once the position is no longer needed.
   */
  private removePlaceholderTransaction(props: {
    id: unknown;
    tr: Transaction;
    checkOnly?: boolean;
  }): boolean {
    const { id, tr, checkOnly = false } = props;
    const existingPosition = this.findPlaceholder(id);

    if (!existingPosition) {
      return false;
    }

    if (checkOnly) {
      return true;
    }

    const { removed } = this.getMeta(tr);
    this.setMeta(tr, { removed: uniqueArray([...removed, id]) });

    return true;
  }

  /**
   * This helper returns a transaction that clears all position trackers when
   * any exist.
   *
   * Otherwise it returns undefined.
   */
  private clearPlaceholdersTransaction(props: { tr: Transaction; checkOnly?: boolean }): boolean {
    const { tr, checkOnly = false } = props;
    const positionTrackerState = this.getPluginState();

    if (positionTrackerState === DecorationSet.empty) {
      return false;
    }

    if (checkOnly) {
      return true;
    }

    this.setMeta(tr, { clearTrackers: true });
    return true;
  }

  /**
   * Handles delayed commands which rely on the
   */
  private readonly createPlaceholderCommand = <Value>(
    props: DelayedPlaceholderCommandProps<Value>,
  ): DelayedCommand<Value> => {
    const id = uniqueId();
    const { promise, placeholder, onFailure, onSuccess } = props;

    return new DelayedCommand(promise)
      .validate((props) => {
        return this.addPlaceholder(id, placeholder)(props);
      })
      .success((props) => {
        const { state, tr, dispatch, view, value } = props;
        const range = this.store.helpers.findPlaceholder(id);

        if (!range) {
          const error = new Error('The placeholder has been removed');
          return onFailure?.({ error, state, tr, dispatch, view }) ?? false;
        }

        this.removePlaceholder(id)({ state, tr, view, dispatch: () => {} });
        return onSuccess(value, range, { state, tr, dispatch, view });
      })

      .failure((props) => {
        this.removePlaceholder(id)({ ...props, dispatch: () => {} });
        return onFailure?.(props) ?? false;
      });
  };
}

const DEFAULT_PLACEHOLDER_META: Required<DecorationPlaceholderMeta> = {
  added: [],
  updated: [],
  clearTrackers: false,
  removed: [],
};

const __type = 'placeholderDecoration';

export interface DecorationPlaceholderMeta {
  /**
   * The trackers to add.
   */
  added?: Array<WithBase<DecorationPlaceholder>>;

  /**
   * The trackers to update with new data. Data is an object and is used to
   * include properties like `progress` for progress indicators. Only `widget`
   * decorations can be updated in this way.
   */
  updated?: Array<{ id: unknown; data: any }>;

  /**
   * The trackers to remove.
   */
  removed?: unknown[];

  /**
   * When set to true will delete all the active trackers.
   */
  clearTrackers?: boolean;
}

interface BasePlaceholder {
  /**
   * A custom class name to use for the placeholder decoration. All the trackers
   * will automatically be given the class name `remirror-tracker-position`
   *
   * @default ''
   */
  className?: string;

  /**
   * A custom html element or string for a created element tag name.
   *
   * @default 'tracker'
   */
  nodeName?: string;
}

interface DataProps<Data = any> {
  /**
   * The data to store for this placeholder.
   */
  data?: Data;
}

interface InlinePlaceholder<Data = any>
  extends BasePlaceholder,
    Partial<FromToProps>,
    DataProps<Data> {
  type: 'inline';
}

interface NodePlaceholder<Data = any> extends BasePlaceholder, DataProps<Data> {
  /**
   * Set this as a node tracker.
   */
  type: 'node';

  /**
   * If provided the The `pos` must be directly before the node in order to be
   * valid. If not provided it will select the parent node of the current
   * selection.
   */
  pos: number | null;
}

export interface WidgetPlaceholder<Data = any> extends BasePlaceholder, DataProps<Data> {
  /**
   * Declare this as a widget tracker.
   *
   * Widget trackers support adding custom components to the created dom
   * element.
   */
  type: 'widget';

  /**
   * Widget trackers only support fixed positions.
   */
  pos: number;

  /**
   * Called the first time this widget decoration is added to the dom.
   */
  createElement?(view: EditorView, pos: number): HTMLElement;

  /**
   * Called whenever the position tracker updates with the new position.
   */
  onUpdate?(view: EditorView, pos: number, element: HTMLElement, data: any): void;

  /**
   * Called when the widget decoration is removed from the dom.
   */
  onDestroy?(view: EditorView, element: HTMLElement): void;
}

type WithBase<Type extends BasePlaceholder> = MakeRequired<Type, keyof BasePlaceholder> & {
  id: unknown;
};

export type DecorationPlaceholder = WidgetPlaceholder | NodePlaceholder | InlinePlaceholder;

/**
 * Generate the persistent selection decoration for when the editor loses focus.
 */
function generatePersistentSelectionDecorations(
  state: EditorState,
  decorationSet: DecorationSet,
  attrs: { class: string },
): DecorationSet {
  const { selection, doc } = state;

  if (selection.empty) {
    return decorationSet;
  }

  const { from, to } = selection;
  const decoration = isNodeSelection(selection)
    ? Decoration.node(from, to, attrs)
    : Decoration.inline(from, to, attrs);

  return decorationSet.add(doc, [decoration]);
}

export interface DelayedPlaceholderCommandProps<Value> {
  /**
   * A function that returns a promise.
   */
  promise: DelayedPromiseCreator<Value>;

  /**
   * The placeholder configuration.
   */
  placeholder: DecorationPlaceholder;

  /**
   * Called when the promise succeeds and the placeholder still exists. If no
   * placeholder can be found (for example, the user has deleted the entire
   * document) then the failure handler is called instead.
   */
  onSuccess: (value: Value, range: FromToProps, commandProps: CommandFunctionProps) => boolean;

  /**
   * Called when a failure is encountered.
   */
  onFailure?: CommandFunction<EditorSchema, { error: any }>;
}

declare global {
  namespace Remirror {
    interface ExtensionStore {
      /**
       * Create delayed command which automatically adds a placeholder to the
       * document while the delayed command is being run and also automatically
       * removes it once it has completed.
       */
      createPlaceholderCommand<Value = any>(
        props: DelayedPlaceholderCommandProps<Value>,
      ): DelayedCommand<Value>;
    }

    interface BaseExtension {
      /**
       * Create a decoration set which adds decorations to your editor. The
       * first parameter is the `EditorState`.
       *
       * This can be used in combination with the `onApplyState` handler which
       * can map the decoration.
       *
       * @param state - the editor state which was passed in.
       */
      createDecorations?(state: EditorState): DecorationSet;
    }

    interface AllExtensions {
      decorations: DecorationsExtension;
    }
  }
}
