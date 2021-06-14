import { css } from '@linaria/core';

/**
 * This is compiled into the class name `remirror-editor` and the css is
 * automatically generated and placed into the `@remirror/styles/core.css` via
 * a `linaria` build script.
 */
export const EDITOR = css`
  div[data-callout-type] {
    margin-left: 0;
    margin-right: 0;
    padding: 16px 16px 16px 12px;
    background-color: #f9f9fa;

    & > *:not(.emoji-block-wrapper) {
      margin-left: 30px;
    }
  }

  div[class*='emoji-block-wrapper'] {
    float: left;
  }
` as 'remirror-editor';
