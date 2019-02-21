// import {
//   ExtensionCommandFunction,
//   MarkExtension,
//   MarkExtensionSpec,
//   NodeExtensionSpec,
//   replaceText,
//   SchemaParams,
// } from '@remirror/core';
// import { SuggestionsPlugin, SuggestionsPluginProps } from '@remirror/mentions-extension';

// export interface TwitterMentionOptions extends SuggestionsPluginProps {
//   mentionClassName?: string;
//   /**
//    * Allows for multiple mentions extensions to be registered for one editor.
//    * The name becomes mention_${type}. If left blank then no type is used.
//    */
//   type?: string;
// }

// export class Mentions<GItem extends {} = any> extends MarkExtension<TwitterMentionOptions> {
//   /**
//    * The name is dynamically generated based on the passed in type.
//    */
//   get name() {
//     const { type } = this.options;
//     return `mentions${type ? `_${type}` : ''}`;
//   }

//   get defaultOptions() {
//     return {
//       matcher: {
//         char: '@',
//         allowSpaces: false,
//         startOfLine: false,
//       },
//       mentionClassName: 'mention',
//       suggestionsClassName: 'mention-suggestion',
//     };
//   }

//   get schema(): MarkExtensionSpec {
//     const {
//       mentionClassName = this.defaultOptions.mentionClassName,
//       matcher = this.defaultOptions.matcher,
//     } = this.options;
//     return {
//       attrs: {
//         id: {},
//         label: {},
//       },
//       group: 'inline',
//       inclusive: false,
//       toDOM: node => [
//         'a',
//         {
//           class: mentionClassName,
//           'data-mention-id': node.attrs.id,
//         },
//         `${matcher.char}${node.attrs.label}`,
//       ],
//       parseDOM: [
//         {
//           tag: 'span[data-mention-id]',
//           getAttrs: dom => {
//             if (typeof dom === 'string') {
//               return false; // string only received when type is a style
//             }
//             const id = (dom as Element).getAttribute('data-mention-id');
//             const label = (dom as HTMLElement).innerText.split(matcher.char).join('');
//             return { id, label };
//           },
//         },
//       ],
//     };
//   }

//   public commands = ({ schema }: SchemaParams): ExtensionCommandFunction => attrs =>
//     replaceText(null, schema.nodes[this.name], attrs);

//   get plugins() {
//     return [
//       SuggestionsPlugin<GItem>({
//         key: this.pluginKey,
//         command: ({ range, attrs, schema }) => replaceText(range, schema.nodes[this.name], attrs),
//         appendText: ' ',
//         matcher: this.options.matcher,
//         items: this.options.items,
//         onEnter: this.options.onEnter,
//         onChange: this.options.onChange,
//         onExit: this.options.onExit,
//         onKeyDown: this.options.onKeyDown,
//         suggestionsClassName: this.options.suggestionsClassName,
//       }),
//     ];
//   }
// }
