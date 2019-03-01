import { NodeViewPortalContainer } from '@remirror/core';
import { ReactNodeView } from '@remirror/react';
import { EmojiSet } from 'emoji-mart/dist-es/utils/shared-props';
import { Plugin, PluginKey } from 'prosemirror-state';
import { Emoji } from './components/emoji';

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
  size?: number | string;
}

export const createEmojiPlugin = ({
  key,
  getPortalContainer,
  set,
  size = '1em',
}: CreateEmojiPluginParams) => {
  return new Plugin({
    key,
    props: {
      nodeViews: {
        emoji: ReactNodeView.createNodeView(Emoji, getPortalContainer, { set, size }),
      },
    },
  });
};
