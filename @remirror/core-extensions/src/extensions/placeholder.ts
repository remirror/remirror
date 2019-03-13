import { Extension, getPluginMeta, getPluginState, isDocNodeEmpty, setPluginMeta } from '@remirror/core';
import { Plugin } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';
import { EMPTY_NODE_CLASS_NAME } from '../constants';

export interface PlaceholderOptions {
  emptyNodeClass?: string;
  additionalStyles?: object;
}

export interface PlaceholderPluginState extends Required<PlaceholderOptions> {
  empty: boolean;
}

interface PlaceholderPluginMeta {
  removePlaceholder?: boolean;
  applyPlaceholderIfEmpty?: boolean;
}

export class Placeholder extends Extension<PlaceholderOptions> {
  get name(): 'placeholder' {
    return 'placeholder';
  }

  get defaultOptions() {
    return {
      emptyNodeClass: EMPTY_NODE_CLASS_NAME,
      additionalStyles: {},
    };
  }

  public plugin() {
    return new Plugin({
      key: this.pluginKey,
      state: {
        init: (_, state): PlaceholderPluginState => ({ ...this.options, empty: isDocNodeEmpty(state.doc) }),
        apply: (tr, prevPluginState: PlaceholderPluginState, _, newState): PlaceholderPluginState => {
          const meta = getPluginMeta<PlaceholderPluginMeta>(this.pluginKey, tr);

          if (meta) {
            if (meta.removePlaceholder) {
              return { ...this.options, empty: false };
            }

            if (meta.applyPlaceholderIfEmpty) {
              return { ...this.options, empty: isDocNodeEmpty(newState.doc) };
            }
          }

          // non-plugin specific transaction; don't excessively recalculate
          // if the document is empty
          if (!tr.docChanged) {
            return prevPluginState;
          }

          return { ...this.options, empty: isDocNodeEmpty(newState.doc) };
        },
      },
      props: {
        decorations: state => {
          const { empty } = getPluginState<PlaceholderPluginState>(this.pluginKey, state);

          if (!empty) {
            return;
          }
          const decorations: Decoration[] = [];
          state.doc.descendants((node, pos) => {
            const decoration = Decoration.node(pos, pos + node.nodeSize, {
              class: this.options.emptyNodeClass,
            });
            decorations.push(decoration);
          });

          return DecorationSet.create(state.doc, decorations);
        },

        /**
         * Borrowed from `atlaskit`
         * Workaround: On Mobile / Android, a user can start typing but it won't trigger
         * an Editor state update so the placeholder will still be shown. We hook into the compositionstart
         * and compositionend events instead, to make sure we show/hide the placeholder for these devices.
         */
        handleDOMEvents: {
          compositionstart: view => {
            const { empty } = getPluginState(this.pluginKey, view.state);

            if (empty) {
              // remove placeholder, since document definitely contains text
              view.dispatch(setPluginMeta(this.pluginKey, view.state.tr, { removePlaceholder: true }));
            }

            return false;
          },
          compositionend: view => {
            const { empty } = getPluginState(this.pluginKey, view.state);

            if (!empty) {
              view.dispatch(
                setPluginMeta(this.pluginKey, view.state.tr, {
                  applyPlaceholderIfEmpty: true,
                }),
              );
            }

            return false;
          },
        },
      },
    });
  }
}
