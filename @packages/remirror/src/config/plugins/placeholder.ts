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
