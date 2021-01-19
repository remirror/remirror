import { css } from '@linaria/core';

import { getTheme } from './utils';

export const EMOJI_IMAGE = css`
  object-fit: contain;
  width: 1.375em;
  height: 1.375em;
  vertical-align: bottom;
`;

export const EMOJI_WRAPPER = css`
  text-indent: -99999px;
`;

export const EMOJI_POPUP_ITEM = css`
  padding: 8px;
  text-overflow: ellipsis;
  max-width: 250px;
  width: 250px;
  overflow: hidden;
  white-space: nowrap;
  color: white;
`;

export const EMOJI_POPUP_HOVERED = css`
  background-color: ${getTheme((t) => t.hue.gray[2])};
`;

export const EMOJI_POPUP_HIGHLIGHT = css`
  background-color: ${getTheme((t) => t.hue.gray[3])};
`;

export const EMOJI_POPUP_WRAPPER = css`
  position: absolute;
  width: max-content;
  padding-top: 8px;
  padding-bottom: 8px;
  margin: 0 auto;
  border-radius: 8px;
  box-shadow: hsla(205, 70%, 15%, 0.25) 0 4px 8px, hsla(205, 70%, 15%, 0.31) 0px 0px 1px;
  background-color: white;
  z-index: 10;
  max-height: 250px;
  overflow-y: scroll;
`;

export const EMOJI_POPUP_NAME = css`
  color: rgb(121, 129, 134);
`;

export const EMOJI_POPUP_CHAR = css`
  font-size: 1.25em;
  padding-right: 5px;
`;
