import {
  ExtensionCommandFunction,
  NodeExtension,
  NodeExtensionProps,
  NodeExtensionSpec,
  PMNode,
  replaceText,
  SchemaNodeTypeParams,
  SchemaParams,
} from '@remirror/core';

export interface EmojiNodeExtensionOptions extends NodeExtensionProps {}

export class EmojiNode extends NodeExtension<EmojiNodeExtensionOptions> {
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
    const schema: NodeExtensionSpec = {
      inline: true,
      group: 'inline',
      selectable: false,
      attrs: {
        shortName: { default: '' },
        id: { default: '' },
        text: { default: '' },
        ...this.extraAttrs(),
      },
      parseDOM: [
        {
          tag: 'span[data-emoji-short-name]',
          getAttrs: domNode => {
            const dom = domNode as HTMLElement;
            return {
              shortName: dom.getAttribute('data-emoji-short-name') || schema.attrs!.shortName.default,
              id: dom.getAttribute('data-emoji-id') || schema.attrs!.id.default,
              text: dom.getAttribute('data-emoji-text') || schema.attrs!.text.default,
            };
          },
        },
      ],
      toDOM(node: PMNode) {
        const { shortName, id, text } = node.attrs;
        const attrs = {
          'data-emoji-short-name': shortName,
          'data-emoji-id': id,
          'data-emoji-text': text,
          contenteditable: 'false',
        };
        return ['span', attrs, text];
      },
    };
    return schema;
  }

  public commands = ({ schema }: SchemaParams): ExtensionCommandFunction => attrs =>
    replaceText(null, schema.nodes[this.name], attrs);

  public plugins({  }: SchemaNodeTypeParams) {
    return [];
  }
}
