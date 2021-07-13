import { css } from '@linaria/core';

/**
 * This is compiled into the class name `remirror-editor` and the css is
 * automatically generated and placed into the `@remirror/styles/core.css` via
 * a `linaria` build script.
 */
export const EDITOR = css`
  &.ProseMirror {
    .ProseMirror-gapcursor {
      display: none;
      pointer-events: none;
      position: absolute;
    }

    .ProseMirror-gapcursor:after {
      content: '';
      display: block;
      position: absolute;
      top: -2px;
      width: 20px;
      border-top: 1px solid black;
      animation: ProseMirror-cursor-blink 1.1s steps(2, start) infinite;
    }

    @keyframes ProseMirror-cursor-blink {
      to {
        visibility: hidden;
      }
    }

    .ProseMirror-focused .ProseMirror-gapcursor,
    &.ProseMirror-focused .ProseMirror-gapcursor {
      display: block;
    }
  }
` as 'remirror-editor';
