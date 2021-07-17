import { css } from '@linaria/core';

/**
 * This generates the `css` for the package `@remirror/extension-whitespace`.
 */
export const EDITOR = css`
  &.ProseMirror {
    .whitespace {
      pointer-events: none;
      user-select: none;
    }

    .whitespace:before {
      caret-color: inherit;
      color: gray;
      display: inline-block;
      font-weight: 400;
      font-style: normal;
      line-height: 1em;
      width: 0;
    }

    .whitespace--s:before {
      content: '·';
    }

    .whitespace--br:before {
      content: '¬';
    }

    .whitespace--p:before {
      content: '¶';
    }
  }
` as 'remirror-editor';
