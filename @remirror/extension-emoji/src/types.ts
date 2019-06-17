import { Attrs, NodeExtensionOptions, NodeType, PluginKey } from '@remirror/core';
import { NodeViewComponentProps } from '@remirror/react';
import { BaseEmoji, Data, EmojiSet } from 'emoji-mart';
import { Interpolation } from 'emotion';
import { ComponentType } from 'react';

export interface EmojiAttrs extends Pick<BaseEmoji, 'id' | 'name' | 'native' | 'colons' | 'skin'> {
  useNative?: boolean;
}

export interface CreateEmojiPluginParams extends Pick<EmojiExtensionOptions, 'emojiData'> {
  key: PluginKey;
  type: NodeType;
}

export interface DefaultEmojiProps extends NodeViewComponentProps<EmojiAttrs> {
  set: EmojiSet;
  size: number | string;
  emojiData: Data;
}

export interface EmojiExtensionOptions extends NodeExtensionOptions {
  transformAttrs?(attrs: Pick<EmojiAttrs, 'name'>): Attrs;

  className?: string;

  /**
   * The emoji collection to use. See https://github.com/missive/emoji-mart#components
   */
  set: EmojiSet;

  /**
   * Set the size of the image used. Once I find a way to use SVG it would be awesome to allow ems that match
   * up with the font size.
   */
  size?: number | string;

  /**
   * The data used for emoji
   */
  emojiData: Data;

  /**
   * The component to use within the displayed prosemirror node view
   *
   * @default DefaultEmoji
   */
  EmojiComponent?: ComponentType<DefaultEmojiProps>;

  /**
   * Allow customization of the styles passed through to the emoji component
   * @default undefined
   */
  style?: Interpolation;
}
