import React, { FC } from 'react';

import { NodeViewComponentProps } from '@remirror/react';
import { Emoji as EmojiComponent } from 'emoji-mart';
import { getEmojiDataById } from '../helpers';
import { EmojiNodeAttrs } from '../types';

export interface EmojiProps extends NodeViewComponentProps<EmojiNodeAttrs> {}

export const Emoji: FC<EmojiProps> = ({ node }) => {
  const { id } = node.attrs;
  const emojiData = getEmojiDataById(id);
  return emojiData ? (
    <EmojiComponent size={64} emoji={emojiData} skin={emojiData.skin || undefined} tooltip={true} />
  ) : null;
};
