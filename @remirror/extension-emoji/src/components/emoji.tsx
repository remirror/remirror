import React, { FC } from 'react';

import { NodeViewComponentProps } from '@remirror/react';
import { Emoji as EmojiComponent } from 'emoji-mart';
import { EmojiSet } from 'emoji-mart/dist-es/utils/shared-props';
import { getEmojiDataById } from '../helpers';
import { EmojiNodeAttrs } from '../types';

export interface EmojiProps extends NodeViewComponentProps<EmojiNodeAttrs> {
  set: EmojiSet;
}

export const Emoji: FC<EmojiProps> = ({ node, set }) => {
  const { id } = node.attrs;
  const emojiData = getEmojiDataById(id);
  return emojiData ? (
    <EmojiComponent size={64} emoji={emojiData} skin={emojiData.skin || undefined} tooltip={true} set={set} />
  ) : null;
};
