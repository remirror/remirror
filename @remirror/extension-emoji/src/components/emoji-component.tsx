import React, { FC } from 'react';

import { NimbleEmoji } from 'emoji-mart';
import { DefaultEmojiProps } from '../emoji-types';

export const DefaultEmoji: FC<DefaultEmojiProps> = ({ node, options }) => {
  const { set, size, emojiData } = options;
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
      <span style={{ visibility: 'hidden' }}>{native}</span>
    </NimbleEmoji>
  );
};
