import React, { FC } from 'react';

import { NimbleEmoji } from 'emoji-mart';
import { DefaultEmojiProps } from '../types';

export const DefaultEmoji: FC<DefaultEmojiProps> = ({ node, set, size, emojiData }) => {
  const { id, skin, useNative, native } = node.attrs;
  return useNative ? (
    <span className='emoji-not-found' style={{ fontSize: size }}>
      {native}
    </span>
  ) : (
    <NimbleEmoji
      data={emojiData}
      emoji={id}
      tooltip={true}
      set={set}
      size={size as any}
      skin={skin || undefined}
    >
      &nbsp;
    </NimbleEmoji>
  );
};
