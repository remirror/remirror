import { css } from 'linaria';

export const coreStyles = css`
  .ProseMirror {
    position: relative;
    word-wrap: break-word;
    white-space: pre-wrap;
    white-space: break-spaces;
    -webkit-font-variant-ligatures: none;
    font-variant-ligatures: none;
    font-feature-settings: 'liga' 0;

    /* the above doesn't seem to work in Edge */

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
  }

  .ProseMirror-hideselection {
    * {
      &::selection,
      &::-moz-selection {
        background: transparent;
      }
    }

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
`;
