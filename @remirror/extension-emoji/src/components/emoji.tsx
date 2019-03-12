import React, { FC } from 'react';

import { Cast } from '@remirror/core';
import { NodeViewComponentProps } from '@remirror/react';
import { Data, EmojiSet, NimbleEmoji } from 'emoji-mart';
import { EmojiNodeAttrs } from '../types';

export interface DefaultEmojiProps extends NodeViewComponentProps<EmojiNodeAttrs> {
  set: EmojiSet;
  size: number | string;
  emojiData: Data;
}

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
      size={Cast(size)}
      skin={skin || undefined}
    >
      &nbsp;
    </NimbleEmoji>
  );
};
