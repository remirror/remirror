import { css } from '@linaria/core';

/**
 * This is compiled into the class name `remirror-editor` and the css is
 * automatically generated and placed into the `@remirror/styles/core.css` via
 * a `linaria` build script.
 */

export const CALLOUT_EMOJI_WRAPPER = 'remirror-callout-emoji-wrapper';

export const EDITOR = css`
  div[data-callout-type] {
    display: flex;
    margin-left: 0;
    margin-right: 0;
    padding: 10px;
    border-left: 2px solid transparent;

    & > :not(.${CALLOUT_EMOJI_WRAPPER}) {
      margin-left: 8px;
      flex-grow: 1;
    }
  }

  div[data-callout-type='info'] {
    background: #eef6fc;
    border-left-color: #3298dc;
  }

  div[data-callout-type='warning'] {
    background: #fffbeb;
    border-left-color: #ffdd57;
  }

  div[data-callout-type='error'] {
    background: #feecf0;
    border-left-color: #f14668;
  }

  div[data-callout-type='success'] {
    background: #effaf3;
    border-left-color: #48c774;
  }

  div[data-callout-type='blank'] {
    background: #f8f8f8;
  }
` as 'remirror-editor';
