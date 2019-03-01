import { NodeViewPortalContainer } from '@remirror/core';
import { ReactNodeView } from '@remirror/react';
import { Plugin, PluginKey } from 'prosemirror-state';
import { Emoji } from './components/emoji';

export interface CreateEmojiPluginParams {
  key: PluginKey;
  portalProviderContainer: NodeViewPortalContainer;
}

export const createEmojiPlugin = ({ key, portalProviderContainer }: CreateEmojiPluginParams) => {
  return new Plugin({
    key,
    props: {
      nodeViews: {
        emoji: ReactNodeView.createNodeView(Emoji, portalProviderContainer),
      },
    },
  });
};
