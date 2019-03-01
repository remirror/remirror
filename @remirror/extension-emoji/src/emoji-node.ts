import {
  ExtensionCommandFunction,
  NodeExtension,
  NodeExtensionOptions,
  NodeExtensionSpec,
  PMNode,
  replaceText,
  SchemaNodeTypeParams,
} from '@remirror/core';
import { EmojiNodeAttrs } from './types';

export interface EmojiNodeOptions extends NodeExtensionOptions {}

export class EmojiNode extends NodeExtension<EmojiNodeOptions> {
  /**
   * The name is dynamically generated based on the passed in type.
   */
  get name() {
    return 'emoji' as 'emoji';
  }

  get defaultOptions() {
    return {
      extraAttrs: [],
    };
  }

  get schema(): NodeExtensionSpec {
    return {
      inline: true,
      group: 'inline',
      selectable: false,
      attrs: {
        id: { default: '' },
        native: { default: '' },
        name: { default: '' },
        ...this.extraAttrs(),
      },
      parseDOM: [
        {
          tag: 'span[data-emoji-id]',
          getAttrs: domNode => {
            const dom = domNode as HTMLElement;
            return {
              id: dom.getAttribute('data-emoji-id') || '',
              native: dom.getAttribute('data-emoji-native') || '',
              name: dom.getAttribute('data-emoji-name') || '',
            };
          },
        },
      ],
      toDOM(node: PMNode) {
        const { id, name, native } = node.attrs as EmojiNodeAttrs;
        const attrs = {
          'data-emoji-id': id,
          'data-emoji-native': native,
          'data-emoji-name': name,
          'aria-label': `Emoji: ${node.attrs.name}`,
          title: `Emoji: ${node.attrs.name}`,
          contenteditable: 'false',
        };
        return ['span', attrs, native];
      },
    };
  }

  public commands = ({ type }: SchemaNodeTypeParams): ExtensionCommandFunction => attrs =>
    replaceText(null, type, attrs);

  public plugins({  }: SchemaNodeTypeParams) {
    return [];
  }
}
