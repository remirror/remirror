import { css } from '@linaria/core';

import { getThemeVar } from './utils';

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

    ::selection,
    .selection {
      background: ${getThemeVar('color', 'selection', 'background')};
      color: ${getThemeVar('color', 'selection', 'text')};
      caret-color: ${getThemeVar('color', 'selection', 'caret')};
      text-shadow: ${getThemeVar('color', 'selection', 'shadow')};
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
  }

  &.ProseMirror-hideselection *::-moz-selection {
    background: transparent;
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
