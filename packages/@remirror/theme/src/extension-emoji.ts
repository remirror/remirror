import { css } from '@linaria/core';

export const EDITOR = css`
  img.emoji {
    object-fit: contain;
    width: 1.375em;
    height: 1.375em;
    vertical-align: bottom;
  }

  span.img[alt] {
    text-indent: -9999px;
  }
` as 'remirror-editor';
