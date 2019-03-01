import React, { FC } from 'react';

import { NodeViewComponentProps } from '@remirror/react';
import { Emoji as EmojiComponent } from 'emoji-mart';
import { EmojiSet } from 'emoji-mart/dist-es/utils/shared-props';
import { getEmojiDataById } from '../helpers';
import { EmojiNodeAttrs } from '../types';

export interface EmojiProps extends NodeViewComponentProps<EmojiNodeAttrs> {
  set: EmojiSet;
  size: number;
}

export const Emoji: FC<EmojiProps> = ({ node, set, size }) => {
  const { id } = node.attrs;
  const emojiData = getEmojiDataById(id);
  return emojiData ? (
    <EmojiComponent
      emoji={emojiData}
      skin={emojiData.skin || undefined}
      tooltip={true}
      set={set}
      size={size}
    />
  ) : null;
};
