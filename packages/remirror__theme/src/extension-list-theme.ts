import { css } from '@linaria/core';

/**
 * This is compiled into the class name `remirror-editor` and the css is
 * automatically generated and placed into the `@remirror/styles/core.css` via
 * a `linaria` build script.
 */
export const EDITOR = css`
  ul[data-checkbox] {
    list-style: none;
    padding-left: 20px;
  }

  li[data-checkbox] {
    display: flex;
    line-height: 1.25;
  }

  li[data-checkbox] > input[type='checkbox'] {
    cursor: pointer;
    vertical-align: baseline;
    position: relative;
    left: -2px;
  }

  li[data-checkbox] > input[type='checkbox'] + p {
    flex: none;
    min-width: 1px;
  }
` as 'remirror-editor';
