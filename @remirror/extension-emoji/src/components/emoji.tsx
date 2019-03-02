import React, { FC } from 'react';

import { Cast } from '@remirror/core';
import { NodeViewComponentProps } from '@remirror/react';
import { Data, NimbleEmoji } from 'emoji-mart';
import { EmojiSet } from 'emoji-mart/dist-es/utils/shared-props';
import { EmojiNodeAttrs } from '../types';

export interface DefaultEmojiProps extends NodeViewComponentProps<EmojiNodeAttrs> {
  set: EmojiSet;
  size: number | string;
  data: Data;
}

export const DefaultEmoji: FC<DefaultEmojiProps> = ({ node, set, size, data }) => {
  const { colons, skin, useNative, native } = node.attrs;
  return useNative ? (
    <span style={{ fontSize: size }}>{native}</span>
  ) : (
    <NimbleEmoji
      data={data}
      emoji={colons}
      tooltip={true}
      set={set}
      size={Cast(size)}
      skin={skin || undefined}
    />
  );
};
