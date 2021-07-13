import { css } from '@linaria/core';

import { getTheme } from './utils';

export const MENTION_ATOM = css`
  background: ${getTheme((t) => t.hue.gray[2])};
  font-weight: bold;
  font-size: 0.9em;
  font-style: normal;
  border-radius: ${getTheme((t) => t.radius.border)};
  padding: 0.2rem 0.5rem;
  white-space: nowrap;
  color: ${getTheme((t) => t.color.primary)};
` as 'remirror-mention-atom';

export const SUGGEST_ATOM = css`
  color: rgba(0, 0, 0, 0.6);
` as 'remirror-suggest-atom';

export const MENTION_ATOM_POPUP_ITEM = css`
  padding: 8px;
  text-overflow: ellipsis;
  max-width: 250px;
  width: 250px;
  overflow: hidden;
  white-space: nowrap;
  color: white;
`;

export const MENTION_ATOM_POPUP_HOVERED = css`
  background-color: ${getTheme((t) => t.hue.gray[2])};
`;

export const MENTION_ATOM_POPUP_HIGHLIGHT = css`
  background-color: ${getTheme((t) => t.hue.gray[3])};
`;

export const MENTION_ATOM_POPUP_WRAPPER = css`
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

export const MENTION_ATOM_POPUP_NAME = css`
  color: rgb(121, 129, 134);
`;

export const MENTION_ATOM_ZERO_ITEMS = css`
  color: rgb(121, 129, 134);
`;

export const MENTION_ATOM_POPUP_CHAR = css`
  font-size: 1.25em;
  padding-right: 5px;
`;
