import {
  Attrs,
  Cast,
  ExtensionCommandFunction,
  NodeExtension,
  NodeExtensionOptions,
  NodeExtensionSpec,
  PMNode,
  replaceText,
  SchemaNodeTypeParams,
} from '@remirror/core';
import emojiRegex from 'emoji-regex';
import { isNumber } from 'lodash';
import { createEmojiPlugin, CreateEmojiPluginParams } from './create-emoji-plugin';
import { nativeEmojiInputRule } from './input-rules';
import { EmojiNodeAttrs } from './types';
export interface EmojiNodeOptions
  extends NodeExtensionOptions,
    Pick<CreateEmojiPluginParams, 'set' | 'size' | 'data'> {
  transformAttrs?(attrs: EmojiNodeAttrs): Attrs;
  className?: string;
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
        class: `remirror-editor-emoji-node${this.options.className ? ' ' + this.options.className : ''}`,
      }),
      className: '',
      size: '1em',
    };
  }

  get schema(): NodeExtensionSpec {
    const { transformAttrs } = this.options;
    return {
      inline: true,
      group: 'inline',
      selectable: false,
      marks: '',
      attrs: {
        id: { default: '' },
        native: { default: '' },
        name: { default: '' },
        colons: { default: '' },
        skin: { default: '' },
        'aria-label': { default: '' },
        title: { default: '' },
        class: { default: '' },
        useNative: { default: false },
        ...this.extraAttrs(),
      },
      parseDOM: [
        {
          tag: 'span[data-emoji-id]',
          getAttrs: domNode => {
            const dom = domNode as HTMLElement;
            const skin = dom.getAttribute('data-emoji-skin');
            const useNative = dom.getAttribute('data-emoji-use-native');
            return {
              id: dom.getAttribute('data-emoji-id') || '',
              native: dom.getAttribute('data-emoji-native') || '',
              name: dom.getAttribute('data-emoji-name') || '',
              colons: dom.getAttribute('data-emoji-colons') || '',
              skin: skin ? Number(skin) : null,
              useNative: useNative === 'true',
            };
          },
        },
      ],
      toDOM(node: PMNode) {
        const { id, name, native, colons, skin, useNative } = node.attrs as EmojiNodeAttrs;
        const attrs = {
          'data-emoji-id': id,
          'data-emoji-colons': colons,
          'data-emoji-native': native,
          'data-emoji-name': name,
          'data-emoji-skin': isNumber(skin) ? String(skin) : '',
          'data-use-native': useNative ? 'true' : 'false',
          ...transformAttrs({ id, name, native, colons, skin }),
        };
        return ['span', attrs, native];
      },
    };
  }

  public commands = ({ type }: SchemaNodeTypeParams): ExtensionCommandFunction => attrs => {
    attrs = { ...attrs, ...this.options.transformAttrs(Cast<EmojiNodeAttrs>(attrs)) };
    return replaceText(null, type, attrs);
  };

  public inputRules({ type }: SchemaNodeTypeParams) {
    return [nativeEmojiInputRule(emojiRegex(), type, this.options.data)];
  }

  public plugins({ getPortalContainer }: SchemaNodeTypeParams) {
    const { set, size, data } = this.options;
    return [createEmojiPlugin({ key: this.pluginKey, getPortalContainer, set, size, data })];
  }
}
