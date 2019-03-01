import {
  ExtensionCommandFunction,
  NodeExtension,
  NodeExtensionSpec,
  PMNode,
  replaceText,
  SchemaNodeTypeParams,
  SchemaParams,
} from '@remirror/core';
import { BaseEmoji } from 'emoji-mart/dist-es/utils/emoji-index/nimble-emoji-index';

export class Emoji extends NodeExtension {
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
        const { id, name, native } = node.attrs as BaseEmoji;
        const attrs = {
          'data-emoji-id': id,
          'data-emoji-native': native,
          'data-emoji-name': name,
          contenteditable: 'false',
        };
        return ['span', attrs, native];
      },
    };
  }

  public commands = ({ schema }: SchemaParams): ExtensionCommandFunction => attrs =>
    replaceText(null, schema.nodes[this.name], attrs);

  public plugins({  }: SchemaNodeTypeParams) {
    return [];
  }
}
