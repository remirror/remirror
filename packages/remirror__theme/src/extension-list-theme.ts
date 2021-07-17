import { css } from '@linaria/core';

import { getTheme } from './utils';

export const LIST_ITEM_WITH_CUSTOM_MARKER = 'remirror-list-item-with-custom-mark';
export const UL_LIST_CONTENT = 'remirror-ul-list-content';

export const EDITOR = css`
  /* don't show the custom markers in a ordered list */
  ol > li > .remirror-list-item-marker-container {
    display: none;
  }

  /* don't show the origin markers when using custom markers (checkbox / collapsible) */
  ul > li.${LIST_ITEM_WITH_CUSTOM_MARKER} {
    list-style: none;
  }
  .${UL_LIST_CONTENT} > li.${LIST_ITEM_WITH_CUSTOM_MARKER} {
    list-style: none;
  }
`;

export const LIST_ITEM_MARKER_CONTAINER = css`
  position: absolute;
  left: -32px;
  width: 24px;
  display: inline-block;
  text-align: center;
` as 'remirror-list-item-marker-container';

export const LIST_ITEM_CHECKBOX = css`
  /* change the checkbox color from blue (default on Chrome) to purple. */
  filter: hue-rotate(60deg);
` as 'remirror-list-item-checkbox';

export const COLLAPSIBLE_LIST_ITEM_CLOSED = css`
  & li {
    display: none;
  }

  & .remirror-collapsible-list-item-button {
    background-color: ${getTheme((t) => t.hue.gray[6])};
  }
` as 'remirror-collapsible-list-item-closed';

export const COLLAPSIBLE_LIST_ITEM_BUTTON = css`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  cursor: pointer;
  display: inline-block;
  vertical-align: middle;

  transition: background-color 0.25s ease;
  background-color: ${getTheme((t) => t.color.border)};

  &:hover {
    background-color: ${getTheme((t) => t.color.primary)};
  }

  &.disabled,
  &.disabled:hover {
    background-color: ${getTheme((t) => t.color.border)};
    cursor: default;
  }
` as 'remirror-collapsible-list-item-button';

export const LIST_SPINE = css`
  position: absolute;
  top: 4px;
  bottom: 0px;
  left: -20px;
  width: 16px;
  cursor: pointer;

  transition: border-left-color 0.25s ease;
  border-left-color: ${getTheme((t) => t.color.border)};
  border-left-style: solid;
  border-left-width: 1px;

  &:hover {
    border-left-color: ${getTheme((t) => t.color.primary)};
  }
` as 'remirror-list-spine';
