import { Extension } from '@remirror/core';
import { isNumber, isString } from '@remirror/core-helpers';
import {
  BaseExtensionOptions,
  CommandFunction,
  CommandParams,
  ExtensionManagerParams,
  PosParams,
  Transaction,
} from '@remirror/core-types';
import { getPluginMeta, getPluginState } from '@remirror/core-utils';
import { Plugin } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';

const CLEAR = Symbol('CLEAR');

const defaultPositionTrackerExtensionOptions: Partial<PositionTrackerExtensionOptions> = {
  defaultClassName: 'remirror-tracker-position',
  defaultElement: 'tracker',
};

export interface PositionTrackerExtensionOptions extends BaseExtensionOptions {
  /**
   * The className that is added to all tracker positions
   *
   * '@defaultValue 'remirror-tracker-position'
   */
  defaultClassName?: string;

  /**
   * The default element that is used for all trackers.
   *
   * @defaultValue 'tracker'
   */
  defaultElement?: string;
}

/**
 * Applies a placeholder to a position in the document for actions that might take a while to complete.
 *
 * An example of this would be uploading an image. From when the upload starts to when it
 * finally completes a lot can happen in the editor. This extension and it's helper functions
 * allow the editor to keep track of where the image should actually be inserted.
 */
export class PositionTrackerExtension extends Extension<PositionTrackerExtensionOptions> {
  get name() {
    return 'positionTracker' as const;
  }

  get defaultOptions() {
    return defaultPositionTrackerExtensionOptions;
  }

  public helpers({ getState }: ExtensionManagerParams) {
    const helpers = {
      /**
       * Add a tracker position with the specified params to the transaction and return the transaction.
       *
       * It is up to you to dispatch the transaction or you can just use the commands.
       */
      addPositionTracker: ({ pos, id }: AddPositionTrackerParams, tr = getState().tr) => {
        const existingPosition = helpers.findPositionTracker(id);

        if (existingPosition) {
          return;
        }

        return tr.setMeta(this.pluginKey, { add: { id, pos: isNumber(pos) ? pos : tr.selection.from } });
      },

      /**
       * Discards a previously defined tracker once not needed.
       *
       * This should be used to cleanup once the position is no longer needed.
       */
      removePositionTracker: ({ id }: RemovePositionTrackerParams, tr = getState().tr) => {
        const existingPosition = helpers.findPositionTracker(id);

        if (!existingPosition) {
          return;
        }

        return tr.setMeta(this.pluginKey, { remove: { id } });
      },

      /**
       * This helper returns a transaction that clears all position tracker when any exist.
       *
       * Otherwise it returns undefined.
       */
      clearPositionTrackers: (tr: Transaction = getState().tr) => {
        const positionTrackerState = getPluginState(this.pluginKey, getState());

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
        const decorations = getPluginState<DecorationSet>(this.pluginKey, getState());
        const found = decorations.find(undefined, undefined, spec => spec.id === id);

        return found.length ? found[0].from : undefined;
      },

      /**
       * Find the positions of all the trackers.in the decoration set.
       *
       * @param id - the unique position id which can be any type
       */
      findAllPositionTrackers: (): Record<string, number> => {
        const trackers: Record<string, number> = Object.create(null);
        const decorations = getPluginState<DecorationSet>(this.pluginKey, getState());
        const found = decorations.find(undefined, undefined, spec => spec.type === this.name);

        for (const decoration of found) {
          trackers[decoration.spec.id] = decoration.from;
        }

        return trackers;
      },
    };

    return helpers;
  }

  public commands({ getHelpers }: CommandParams) {
    const commandFactory = <GArg>(helperName: string) => (params: GArg): CommandFunction => (_, dispatch) => {
      const helper = getHelpers(helperName);
      const tr = helper(params);

      // Nothing changed therefore do nothing
      if (!tr) {
        return false;
      }

      if (dispatch) {
        dispatch(tr);
      }

      return true;
    };

    return {
      /**
       * Command to dispatch a transaction adding the tracker position to be tracked.
       * If no position parameter is specified it uses the current position.
       */
      addPositionTracker: commandFactory<AddPositionTrackerParams>('addPositionTracker'),

      /**
       * A command to remove the specified tracker position.
       */
      removePositionTracker: commandFactory<RemovePositionTrackerParams>('removePositionTracker'),

      /**
       * A command to remove all active tracker positions.
       */
      clearPositionTrackers: commandFactory<void>('clearPositionTrackers'),
    };
  }

  public plugin() {
    const key = this.pluginKey;
    const name = this.name;

    return new Plugin<DecorationSet>({
      key,
      state: {
        init() {
          return DecorationSet.empty;
        },
        apply: (tr, decorationSet) => {
          // Map the decoration based on the changes to the document.
          decorationSet = decorationSet.map(tr.mapping, tr.doc);

          // Get tracker updates from the meta data
          const tracker = getPluginMeta<PositionTrackerExtensionMeta>(key, tr);

          if (!tracker) {
            return decorationSet;
          }

          if (tracker.add) {
            const { defaultClassName, defaultElement } = this.options;
            const { className, element = defaultElement } = tracker.add;
            const widget = isString(element) ? document.createElement(element) : element;
            const classNames = className ? [defaultClassName, className] : [defaultClassName];

            widget.classList.add(...classNames);

            const deco = Decoration.widget(tracker.add.pos, widget, {
              id: tracker.add.id,
              type: name,
            });

            return decorationSet.add(tr.doc, [deco]);
          }

          if (tracker.remove) {
            const { remove } = tracker;
            const found = decorationSet.find(undefined, undefined, spec => spec.id === remove.id);

            return decorationSet.remove(found);
          }

          if (tracker.clear === CLEAR) {
            return DecorationSet.empty;
          }

          return decorationSet;
        },
      },
      props: {
        decorations: state => {
          return getPluginState(key, state);
        },
      },
    });
  }
}

export interface PositionTrackerExtensionMeta {
  add?: Required<AddPositionTrackerParams>;
  remove?: RemovePositionTrackerParams;
  clear?: symbol;
}

interface RemovePositionTrackerParams {
  /**
   * The ID by which this position will be uniquely identified.
   */
  id: unknown;
}

interface AddPositionTrackerParams extends Partial<PosParams>, RemovePositionTrackerParams {
  /**
   * A custom class name to use for the tracker position. All the trackers
   * will automatically be given the class name `remirror-tracker-position`
   *
   * @defaultValue ''
   */
  className?: string;

  /**
   * A custom html element or string for a created element tag name.
   *
   * @defaultValue 'tracker'
   */
  element?: string | HTMLElement;
}
