import { NodeType, NodeViewPortalContainer, PluginKey } from '@remirror/core';
import { NodeViewComponentProps } from '@remirror/react';
import { BaseEmoji, Data, EmojiSet } from 'emoji-mart';
import { Interpolation } from 'emotion';
import { ComponentType } from 'react';

export interface EmojiNodeAttrs extends Pick<BaseEmoji, 'id' | 'name' | 'native' | 'colons' | 'skin'> {
  useNative?: boolean;
}

export interface CreateEmojiPluginParams {
  key: PluginKey;
  getPortalContainer(): NodeViewPortalContainer;
  /**
   * The emoji collection to use. See https://github.com/missive/emoji-mart#components
   */
  set: EmojiSet;
  /**
   * Set the size of the image used. Once I find a way to use SVG it would be awesome to allow ems that match
   * up with the font size.
   */
  size: number | string;

  /**
   * The data used for emoji
   */
  emojiData: Data;
  type: NodeType;
  EmojiComponent: ComponentType<DefaultEmojiProps>;

  /**
   * Allow customization of the styles passed through to the emoji component
   */
  style: Interpolation;
}

export interface DefaultEmojiProps extends NodeViewComponentProps<EmojiNodeAttrs> {
  set: EmojiSet;
  size: number | string;
  emojiData: Data;
}
