import { css } from '@linaria/core';

/**
 * This is compiled into the class name `remirror-editor` and the css is
 * automatically generated and placed into the `@remirror/styles/core.css` via
 * a `linaria` build script.
 */
export const EDITOR = css`
  &.ProseMirror {
    word-wrap: break-word;
    white-space: pre-wrap;
    white-space: break-spaces;
    position: relative;
    font-variant-ligatures: none;
    font-feature-settings: 'liga' 0;
    overflow-y: scroll;

    pre {
      white-space: pre-wrap;
    }

    li {
      position: relative;
    }

    &[contenteditable='false'] {
      white-space: normal;
    }

    &[contenteditable='true'] {
      white-space: pre-wrap;
    }

    hr {
      border-color: #2e2e2e;
    }

    /* Protect against generic img rules. See also https://github.com/ProseMirror/prosemirror-view/commit/aaa50d592074c8063fc2ef77907ab6d0373822fb */
    img.ProseMirror-separator {
      display: inline !important;
      border: none !important;
      margin: 0 !important;
    }
  }

  &.ProseMirror-hideselection *::selection {
    background: transparent;
    color: inherit;
  }

  &.ProseMirror-hideselection *::-moz-selection {
    background: transparent;
    color: inherit;
  }

  &.ProseMirror-hideselection {
    caret-color: transparent;
  }

  .ProseMirror-selectednode {
    outline: 2px solid #8cf;
  }

  /* Make sure li selections wrap around markers */

  li.ProseMirror-selectednode {
    outline: none;

    &:after {
      content: '';
      position: absolute;
      left: -32px;
      right: -2px;
      top: -2px;
      bottom: -2px;
      border: 2px solid #8cf;
      pointer-events: none;
    }
  }
` as 'remirror-editor';
