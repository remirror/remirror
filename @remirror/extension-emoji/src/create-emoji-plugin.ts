import { ReactNodeView } from '@remirror/react';
import { Plugin, PluginKey } from 'prosemirror-state';

export interface CreateEmojiPluginParams {
  key: PluginKey;
}

export const createEmojiPlugin = ({ key }: CreateEmojiPluginParams) => {
  return new Plugin({
    key,
    props: {
      nodeViews: {
        emoji: ReactNodeView.createNodeView(),
      },
    },
  });
};
