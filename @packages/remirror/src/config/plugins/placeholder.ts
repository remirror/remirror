import { Plugin } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';
import { Extension } from '../utils';

export interface PlaceholderOptions {
  emptyNodeClass?: string;
  additionalStyles?: object;
}
export interface PlaceholderPluginState extends Required<PlaceholderOptions> {}

export default class Placeholder extends Extension<PlaceholderOptions> {
  public readonly name = 'placeholder';

  get defaultOptions() {
    return {
      emptyNodeClass: 'is-empty',
      additionalStyles: {},
    };
  }

  get plugins() {
    const options = this.options;
    return [
      new Plugin({
        key: this.pluginKey,
        state: {
          init() {
            return options;
          },
          apply() {
            return options;
          },
        },
        props: {
          decorations: ({ doc }) => {
            const decorations: Decoration[] = [];
            const completelyEmpty =
              doc.textContent === '' && doc.childCount <= 1 && doc.content.size <= 2;

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
      }),
    ];
  }
}

// import { Node } from 'prosemirror-model';
// import { Plugin } from 'prosemirror-state';
// import { Decoration, DecorationSet } from 'prosemirror-view';

// export default () => {
//   const plugin = new Plugin<EditorSchema>({
//     props: {
//       decorations(state) {
//         const decorations: Decoration[] = [];
//         // plugin.getState(state);

//         const decorate = (node: Node<EditorSchema>, pos: number) => {
//           if (node.type.isBlock && node.childCount === 0) {
//             decorations.push(
//               Decoration.node(pos, pos + node.nodeSize, {
//                 class: 'empty-placeholder-node',
//               }),
//             );
//           }
//         };

//         state.doc.descendants(decorate);

//         return DecorationSet.create(state.doc, decorations);
//       },
//     },
//   });

//   return plugin;
// };
