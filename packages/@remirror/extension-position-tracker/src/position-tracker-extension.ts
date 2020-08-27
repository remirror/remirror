import {
  CommandFunction,
  CreatePluginReturn,
  extensionDecorator,
  isEmptyArray,
  isNullOrUndefined,
  isNumber,
  isString,
  object,
  PlainExtension,
  PosParameter,
  Static,
  Transaction,
} from '@remirror/core';
import { Decoration, DecorationSet } from '@remirror/pm/view';

export interface PositionTrackerOptions {
  /**
   * The className that is added to all tracker positions
   *
   * '@default 'remirror-tracker-position'
   */
  class?: Static<string>;

  /**
   * The default element that is used for all trackers.
   *
   * @default 'tracker'
   */
  element?: Static<string>;
}

const CLEAR = Symbol('CLEAR');

/**
 * An extension for the remirror editor. CHANGE ME.
 */
@extensionDecorator<PositionTrackerOptions>({
  defaultOptions: {
    class: 'remirror-tracker-position',
    element: 'tracker',
  },
  staticKeys: ['class', 'element'],
})
export class PositionTrackerExtension extends PlainExtension<PositionTrackerOptions> {
  get name() {
    return 'positionTracker' as const;
  }

  createHelpers() {
    const helpers = {
      /**
       * Add a tracker position with the specified params to the transaction and return the transaction.
       *
       * It is up to you to dispatch the transaction or you can just use the commands.
       */
      addPositionTracker: (parameter: AddPositionTrackerParameter, tr: Transaction) => {
        const { id, pos } = parameter;
        const existingPosition = helpers.findPositionTracker(id);

        if (existingPosition) {
          return;
        }

        return tr.setMeta(this.pluginKey, {
          add: { id, pos: isNumber(pos) ? pos : tr.selection.from },
        });
      },

      /**
       * Discards a previously defined tracker once not needed.
       *
       * This should be used to cleanup once the position is no longer needed.
       */
      removePositionTracker: (parameter: RemovePositionTrackerParameter, tr: Transaction) => {
        const { id } = parameter;
        const existingPosition = helpers.findPositionTracker(id);

        if (!existingPosition) {
          return;
        }

        return tr.setMeta(this.pluginKey, { remove: { id } });
      },

      /**
       * This helper returns a transaction that clears all position trackers when any exist.
       *
       * Otherwise it returns undefined.
       */
      clearPositionTrackers: (tr: Transaction) => {
        const positionTrackerState = this.getPluginState();

        if (positionTrackerState === DecorationSet.empty) {
          return;
        }

        return tr.setMeta(this.pluginKey, { clear: CLEAR });
      },

      /**
       * Find the position for the tracker with the ID specified.
       *
       * @param id - the unique position id which can be any type
       */
      findPositionTracker: (id: unknown) => {
        const decorations = this.getPluginState<DecorationSet>();
        const found = decorations.find(undefined, undefined, (spec) => spec.id === id);

        return !isEmptyArray(found) ? found[0].from : undefined;
      },

      /**
       * Find the positions of all the trackers.in the decoration set.
       *
       * @param id - the unique position id which can be any type
       */
      findAllPositionTrackers: (): Record<string, number> => {
        const trackers: Record<string, number> = object();
        const decorations = this.getPluginState<DecorationSet>();
        const found = decorations.find(undefined, undefined, (spec) => spec.type === this.name);

        for (const decoration of found) {
          trackers[decoration.spec.id] = decoration.from;
        }

        return trackers;
      },
    };

    return helpers;
  }

  #commandFactory = <Parameter>(helperName: string) => {
    return (parameter: Parameter): CommandFunction => ({ dispatch, tr }) => {
      const helper = this.store.getHelpers()[helperName];
      const newTr = helper(parameter, tr);

      if (!newTr) {
        return false;
      }

      if (dispatch) {
        dispatch(newTr);
      }

      return true;
    };
  };

  createCommands() {
    return {
      /**
       * Command to dispatch a transaction adding the tracker position to be tracked.
       * If no position parameter is specified it uses the current position.
       */
      addPositionTracker: this.#commandFactory<AddPositionTrackerParameter>('addPositionTracker'),

      /**
       * A command to remove the specified tracker position.
       */
      removePositionTracker: this.#commandFactory<RemovePositionTrackerParameter>(
        'removePositionTracker',
      ),

      /**
       * A command to remove all active tracker positions.
       */
      clearPositionTrackers: this.#commandFactory<void>('clearPositionTrackers'),
    };
  }

  createPlugin(): CreatePluginReturn<DecorationSet> {
    const name = this.name;

    return {
      state: {
        init: () => {
          return DecorationSet.empty;
        },
        apply: (tr, decorationSet) => {
          // Map the decoration based on the changes to the document.
          decorationSet = decorationSet.map(tr.mapping, tr.doc);

          // Get tracker updates from the meta data
          const tracker: PositionTrackerExtensionMeta = tr.getMeta(this.pluginKey);

          if (isNullOrUndefined(tracker)) {
            return decorationSet;
          }

          if (tracker.add) {
            const { className, element = this.options.element } = tracker.add;
            const widget = isString(element) ? document.createElement(element) : element;
            const classNames = className ? [this.options.class, className] : [this.options.class];

            widget.classList.add(...classNames);

            const deco = Decoration.widget(tracker.add.pos, widget, {
              id: tracker.add.id,
              type: name,
            });

            return decorationSet.add(tr.doc, [deco]);
          }

          if (tracker.remove) {
            const { remove } = tracker;
            const found = decorationSet.find(undefined, undefined, (spec) => spec.id === remove.id);

            return decorationSet.remove(found);
          }

          if (tracker.clear === CLEAR) {
            return DecorationSet.empty;
          }

          return decorationSet;
        },
      },
      props: {
        decorations: () => {
          return this.getPluginState();
        },
      },
    };
  }
}

export interface PositionTrackerExtensionMeta {
  add?: Required<AddPositionTrackerParameter>;
  remove?: RemovePositionTrackerParameter;
  clear?: symbol;
}

interface RemovePositionTrackerParameter {
  /**
   * The ID by which this position will be uniquely identified.
   */
  id: unknown;
}

interface AddPositionTrackerParameter
  extends Partial<PosParameter>,
    RemovePositionTrackerParameter {
  /**
   * A custom class name to use for the tracker position. All the trackers
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
  element?: string | HTMLElement;
}
