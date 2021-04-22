import { css } from '@linaria/core';

export const EDITOR = css``;

export const LIST_ITEM_CHECKBOX_CONTAINER = css`
  position: absolute;
  left: -24px;
` as 'remirror-list-item-checkbox-container';

export const LIST_ITEM_CHECKBOX = css`
  /* change the checkbox color from blue (default on Chrome) to purple. */
  filter: hue-rotate(60deg);
` as 'remirror-list-item-checkbox';

export const CHECKBOX_LIST_ITEM = css`
  display: flex;
  flex-direction: row;
` as 'remirror-checkbox-list-item';
