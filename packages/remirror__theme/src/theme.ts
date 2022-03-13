import { css } from '@linaria/core';

import { createThemeVariables, defaultRemirrorTheme, getThemeVar } from './utils';

/**
 * Create the theme variables from the provided theme.
 * The class name for adding theme styles to the remirror editor.
 */
export const THEME = css`
  /* The following makes it easier to measure components within the editor. */
  box-sizing: border-box;

  *,
  *:before,
  *:after {
    /** Preserve box-sizing when override exists:
   * https://css-tricks.com/inheriting-box-sizing-probably-slightly-better-best-practice/
   * */
    box-sizing: inherit;
  }

  ${createThemeVariables(defaultRemirrorTheme).css}

  font-family: ${getThemeVar('fontFamily', 'default')};
  line-height: ${getThemeVar('lineHeight', 'default')};
  font-weight: ${getThemeVar('fontWeight', 'default')};

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    color: ${getThemeVar('color', 'text')};
    font-family: ${getThemeVar('fontFamily', 'heading')};
    line-height: ${getThemeVar('lineHeight', 'heading')};
    font-weight: ${getThemeVar('fontWeight', 'heading')};
  }

  h1 {
    font-size: ${getThemeVar('fontSize', 5)};
  }

  h2 {
    font-size: ${getThemeVar('fontSize', 4)};
  }

  h3 {
    font-size: ${getThemeVar('fontSize', 3)};
  }

  h4 {
    font-size: ${getThemeVar('fontSize', 2)};
  }

  h5 {
    font-size: ${getThemeVar('fontSize', 1)};
  }

  h6 {
    font-size: ${getThemeVar('fontSize', 0)};
  }

  .ProseMirror {
    min-height: ${getThemeVar('space', 6)};
    box-shadow: ${getThemeVar('color', 'border')} 0px 0px 0px 0.1em;
    padding: ${getThemeVar('space', 3)};
    border-radius: ${getThemeVar('radius', 'border')};
    outline: none;

    &:active,
    &:focus {
      box-shadow: ${getThemeVar('color', 'outline')} 0px 0px 0px 0.2em;
    }

    p,
    h1,
    h2,
    h3,
    h4,
    h4,
    h5,
    h6,
    span {
      margin: 0;
      /* margin-bottom: ${getThemeVar('space', 2)}; */
    }
  }
`;
