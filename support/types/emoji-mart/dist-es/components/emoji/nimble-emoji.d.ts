import React = require('react');

import { Data, EmojiProps } from '../..';

export interface NimbleEmojiProps extends EmojiProps {
  data: Data;
}

// tslint:disable-next-line strict-export-declare-modifiers
declare const NimbleEmoji: React.SFC<NimbleEmojiProps>;

export { NimbleEmoji as default };
