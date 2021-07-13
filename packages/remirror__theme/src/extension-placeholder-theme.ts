import { css } from '@linaria/core';

/**
 * The styles for the placeholder which denotes the document is empty.
 */
export const IS_EMPTY = css`
  &:first-of-type::before {
    position: absolute;
    color: #aaa;
    pointer-events: none;
    height: 0;
    font-style: italic;
    content: attr(data-placeholder);
  }
` as 'remirror-is-empty';
