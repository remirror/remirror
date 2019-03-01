import React, { FC } from 'react';

import { Cast } from '@remirror/core';
import { NodeViewComponentProps } from '@remirror/react';
import { Emoji as EmojiComponent } from 'emoji-mart';
import { EmojiSet } from 'emoji-mart/dist-es/utils/shared-props';
import { EmojiNodeAttrs } from '../types';

export interface EmojiProps extends NodeViewComponentProps<EmojiNodeAttrs> {
  set: EmojiSet;
  size: number | string;
}

export const Emoji: FC<EmojiProps> = ({ node, set, size }) => {
  const { colons, skin, useNative, native } = node.attrs;
  return useNative ? (
    <>{native}</>
  ) : (
    <EmojiComponent emoji={colons} tooltip={true} set={set} size={Cast(size)} skin={skin || undefined} />
  );
};
