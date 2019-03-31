import {
  Attrs,
  Cast,
  EDITOR_CLASS_NAME,
  ExtensionCommandFunction,
  NodeExtension,
  NodeExtensionOptions,
  NodeExtensionSpec,
  replaceText,
  SchemaNodeTypeParams,
} from '@remirror/core';
import { DefaultEmoji } from './components/emoji';
import { createEmojiPlugin } from './plugin';
import { CreateEmojiPluginParams, EmojiNodeAttrs } from './types';

export interface EmojiNodeOptions
  extends NodeExtensionOptions,
    Pick<CreateEmojiPluginParams, 'set' | 'emojiData'>,
    Partial<Pick<CreateEmojiPluginParams, 'size' | 'EmojiComponent' | 'style'>> {
  transformAttrs?(attrs: Pick<EmojiNodeAttrs, 'name'>): Attrs;
  className?: string;
}

export class EmojiNode extends NodeExtension<EmojiNodeOptions> {
  /**
   * The name is dynamically generated based on the passed in type.
   */
  get name() {
    return 'emoji' as const;
  }

  get defaultOptions() {
    return {
      extraAttrs: [],
      transformAttrs: (attrs: Pick<EmojiNodeAttrs, 'name'>) => ({
        'aria-label': `Emoji: ${attrs.name}`,
        title: `Emoji: ${attrs.name}`,
        class: `${EDITOR_CLASS_NAME}-emoji-node${this.options.className ? ' ' + this.options.className : ''}`,
      }),
      className: '',
      size: '1.1em',
      style: {},
      EmojiComponent: DefaultEmoji,
    };
  }

  get schema(): NodeExtensionSpec {
    const { transformAttrs } = this.options;
    return {
      inline: true,
      group: 'inline',
      selectable: false,
      atom: false,
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

            const attrs = {
              id: dom.getAttribute('data-emoji-id') || '',
              native: dom.getAttribute('data-emoji-native') || '',
              name: dom.getAttribute('data-emoji-name') || '',
              colons: dom.getAttribute('data-emoji-colons') || '',
              skin: skin ? Number(skin) : null,
              useNative: useNative === 'true',
            };

            return attrs;
          },
        },
      ],
      toDOM: node => {
        const { id, name, native, colons, skin, useNative } = node.attrs as EmojiNodeAttrs;
        const attrs = {
          'data-emoji-id': id,
          'data-emoji-colons': colons,
          'data-emoji-native': native,
          'data-emoji-name': name,
          'data-emoji-skin': !isNaN(Number(skin)) ? String(skin) : '',
          'data-use-native': useNative ? 'true' : 'false',
          contenteditable: 'false',
          ...transformAttrs({ name }),
        };
        return ['span', attrs, native];
      },
    };
  }

  public commands = ({ type }: SchemaNodeTypeParams): ExtensionCommandFunction => attrs => {
    attrs = { ...attrs, ...this.options.transformAttrs(Cast<EmojiNodeAttrs>(attrs)) };
    return replaceText(null, type, attrs);
  };

  public plugin({ getPortalContainer, type }: SchemaNodeTypeParams) {
    const { set, size, emojiData, EmojiComponent, style } = this.options;
    return createEmojiPlugin({
      key: this.pluginKey,
      style,
      getPortalContainer,
      set,
      size,
      emojiData,
      type,
      EmojiComponent,
    });
  }
}
