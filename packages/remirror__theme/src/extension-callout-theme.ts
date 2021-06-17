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
    border-radius: 10px;
  }

  div[class*='paragraph-callout-block'] {
    margin-left: 8px;
  }

  div[data-callout-type='info'] {
    background: #d3e3ff;
  }

  div[data-callout-type='warning'] {
    background: #fee1a9;
  }

  div[data-callout-type='error'] {
    background: #fdd7d4;
  }

  div[data-callout-type='success'] {
    background: #d8eada;
  }

  div[data-callout-type='idea'] {
    background: #dedde0;
  }
` as 'remirror-editor';
