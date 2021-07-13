import { css } from '@linaria/core';

import { getTheme } from './utils';

/**
 * This is compiled into the class name `remirror-editor` and the css is
 * automatically generated and placed into the `@remirror/styles/core.css` via
 * a `linaria` build script.
 */
export const EDITOR = css`
  &.ProseMirror {
    blockquote {
      border-left: 3px solid ${getTheme((t) => t.hue.gray[3])};
      margin-left: 0;
      margin-right: 0;
      padding-left: 10px;
      font-style: italic;
    }
    blockquote p {
      color: #888;
    }
  }
` as 'remirror-editor';
