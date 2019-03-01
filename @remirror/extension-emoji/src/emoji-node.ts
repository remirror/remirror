import {
  Attrs,
  ExtensionCommandFunction,
  NodeExtension,
  NodeExtensionOptions,
  NodeExtensionSpec,
  PMNode,
  replaceText,
  SchemaNodeTypeParams,
} from '@remirror/core';
import { createEmojiPlugin, CreateEmojiPluginParams } from './create-emoji-plugin';
import { EmojiNodeAttrs } from './types';

export interface EmojiNodeOptions
  extends NodeExtensionOptions,
    Pick<CreateEmojiPluginParams, 'set' | 'size'> {
  transformAttrs?(attrs: EmojiNodeAttrs): Attrs;
}

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
      transformAttrs: (attrs: EmojiNodeAttrs) => ({
        'aria-label': `Emoji: ${attrs.name}`,
        title: `Emoji: ${attrs.name}`,
      }),
    };
  }

  get schema(): NodeExtensionSpec {
    const { transformAttrs } = this.options;
    return {
      inline: true,
      group: 'inline',
      selectable: false,
      atom: true,
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
          ...transformAttrs({ id, name, native }),
          contenteditable: 'false',
        };
        console.log(attrs);
        return ['span', attrs, native];
      },
    };
  }

  public commands = ({ type }: SchemaNodeTypeParams): ExtensionCommandFunction => attrs => {
    console.log(attrs);
    attrs = { ...attrs, ...this.options.transformAttrs(attrs as EmojiNodeAttrs) };
    return replaceText(null, type, attrs);
  };

  public plugins({ getPortalContainer }: SchemaNodeTypeParams) {
    const { set, size } = this.options;
    return [createEmojiPlugin({ key: this.pluginKey, getPortalContainer, set, size })];
  }
}
