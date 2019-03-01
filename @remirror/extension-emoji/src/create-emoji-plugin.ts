import { NodeViewPortalContainer } from '@remirror/core';
import { ReactNodeView } from '@remirror/react';
import { EmojiSet } from 'emoji-mart/dist-es/utils/shared-props';
import { Plugin, PluginKey } from 'prosemirror-state';
import { Emoji } from './components/emoji';

export interface CreateEmojiPluginParams {
  key: PluginKey;
  portalProviderContainer: NodeViewPortalContainer;
  set: EmojiSet;
}

export const createEmojiPlugin = ({ key, portalProviderContainer, set }: CreateEmojiPluginParams) => {
  return new Plugin({
    key,
    props: {
      nodeViews: {
        emoji: ReactNodeView.createNodeView(Emoji, portalProviderContainer, { set }),
      },
    },
  });
};
