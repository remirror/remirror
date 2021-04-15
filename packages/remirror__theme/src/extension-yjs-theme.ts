import { css } from '@linaria/core';

/**
 * This magic property is transformed by babel via linaria into CSS that will be
 * wrapped by the `.remirror-editor` class; when you edit it you must run `yarn
 * fix:css` to regenerate `@remirror/styles/all.css`.
 */
export const EDITOR = css`
  &.ProseMirror {
    .ProseMirror-yjs-cursor {
      position: absolute;
      border-left: black;
      border-left-style: solid;
      border-left-width: 2px;
      border-color: orange;
      height: 1em;
      word-break: normal;
      pointer-events: none;

      > div {
        position: relative;
        top: -1.05em;
        font-size: 13px;
        background-color: rgb(250, 129, 0);
        font-family: serif;
        font-style: normal;
        font-weight: normal;
        line-height: normal;
        user-select: none;
        color: white;
        padding-left: 2px;
        padding-right: 2px;
      }
    }

    > .ProseMirror-yjs-cursor:first-child {
      margin-top: 16px;
    }
  }

  #y-functions {
    position: absolute;
    top: 20px;
    right: 20px;

    > * {
      display: inline-block;
    }
  }
` as 'remirror-editor';
