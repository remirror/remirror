import {
  Attrs,
  Cast,
  CommandNodeTypeParams,
  ExtensionManagerNodeTypeParams,
  isElementDOMNode,
  NodeExtension,
  NodeExtensionSpec,
  replaceText,
} from '@remirror/core';
import { ReactNodeView } from '@remirror/react';
import { DefaultEmoji } from './components/emoji-component';
import { createEmojiPlugin } from './emoji-plugin';
import { EmojiAttrs, EmojiExtensionOptions } from './emoji-types';

export class EmojiExtension extends NodeExtension<EmojiExtensionOptions> {
  /**
   * The name is dynamically generated based on the passed in type.
   */
  get name() {
    return 'emoji' as const;
  }

  get defaultOptions() {
    return {
      transformAttrs: (attrs: Pick<EmojiAttrs, 'name'>) => ({
        'aria-label': `Emoji: ${attrs.name}`,
        title: `Emoji: ${attrs.name}`,
        class: this.options.className,
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
          getAttrs: node => {
            if (!isElementDOMNode(node)) {
              return false;
            }

            const skin = node.getAttribute('data-emoji-skin');
            const useNative = node.getAttribute('data-emoji-use-native');

            const attrs = {
              id: node.getAttribute('data-emoji-id') || '',
              native: node.getAttribute('data-emoji-native') || '',
              name: node.getAttribute('data-emoji-name') || '',
              colons: node.getAttribute('data-emoji-colons') || '',
              skin: skin ? Number(skin) : null,
              useNative: useNative === 'true',
            };

            return attrs;
          },
        },
      ],
      toDOM: node => {
        const { id, name, native, colons, skin, useNative } = node.attrs as EmojiAttrs;
        console.log(transformAttrs({ name }));
        const attrs = {
          'data-emoji-id': id,
          'data-emoji-colons': colons,
          'data-emoji-native': native,
          'data-emoji-name': name,
          'data-emoji-skin': !isNaN(Number(skin)) ? String(skin) : '',
          'data-use-native': useNative ? 'true' : 'false',
          ...transformAttrs({ name }),
        };
        return ['span', attrs, native];
      },
    };
  }

  public commands({ type }: CommandNodeTypeParams) {
    return {
      emoji: (attrs?: Attrs) => {
        attrs = { ...attrs, ...this.options.transformAttrs(Cast<EmojiAttrs>(attrs)) };
        return replaceText({ type, attrs });
      },
    };
  }

  public plugin({ type }: ExtensionManagerNodeTypeParams) {
    const { emojiData } = this.options;
    return createEmojiPlugin({
      key: this.pluginKey,
      emojiData,
      type,
    });
  }

  public nodeView({ portalContainer }: ExtensionManagerNodeTypeParams) {
    const { EmojiComponent, ...options } = this.options;

    return ReactNodeView.createNodeView({
      Component: EmojiComponent,
      portalContainer,
      options,
    });
  }
}
