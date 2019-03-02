import { Extension } from '@remirror/core';
import { Plugin } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';

export interface PlaceholderOptions {
  emptyNodeClass?: string;
  additionalStyles?: object;
}
export interface PlaceholderPluginState extends Required<PlaceholderOptions> {}

export class Placeholder extends Extension<PlaceholderOptions> {
  get name(): 'placeholder' {
    return 'placeholder';
  }

  get defaultOptions() {
    return {
      emptyNodeClass: 'is-empty',
      additionalStyles: {},
    };
  }

  public plugin() {
    return new Plugin({
      key: this.pluginKey,
      state: {
        init: () => this.options,
        apply: () => this.options,
      },
      props: {
        decorations: ({ doc }) => {
          const decorations: Decoration[] = [];
          const completelyEmpty = doc.textContent === '' && doc.childCount <= 1 && doc.content.size <= 2;

          doc.descendants((node, pos) => {
            if (!completelyEmpty) {
              return;
            }

            const decoration = Decoration.node(pos, pos + node.nodeSize, {
              class: this.options.emptyNodeClass,
            });
            decorations.push(decoration);
          });

          return DecorationSet.create(doc, decorations);
        },
      },
    });
  }
}
