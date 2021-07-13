import { css } from '@linaria/core';

import { createThemeVariables, defaultRemirrorTheme, getTheme } from './utils';

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

  font-family: ${getTheme((t) => t.fontFamily.default)};
  line-height: ${getTheme((t) => t.lineHeight.default)};
  font-weight: ${getTheme((t) => t.fontWeight.default)};

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    color: ${getTheme((t) => t.color.text)};
    font-family: ${getTheme((t) => t.fontFamily.heading)};
    line-height: ${getTheme((t) => t.lineHeight.heading)};
    font-weight: ${getTheme((t) => t.fontWeight.heading)};
  }

  h1 {
    font-size: ${getTheme((t) => t.fontSize[5])};
  }

  h2 {
    font-size: ${getTheme((t) => t.fontSize[4])};
  }

  h3 {
    font-size: ${getTheme((t) => t.fontSize[3])};
  }

  h4 {
    font-size: ${getTheme((t) => t.fontSize[2])};
  }

  h5 {
    font-size: ${getTheme((t) => t.fontSize[1])};
  }

  h6 {
    font-size: ${getTheme((t) => t.fontSize[0])};
  }

  .ProseMirror {
    min-height: ${getTheme((t) => t.space[6])};
    box-shadow: ${getTheme((t) => t.color.border)} 0px 0px 0px 0.1em;
    padding: ${getTheme((t) => t.space[3])};
    border-radius: ${getTheme((t) => t.radius.border)};
    outline: none;

    &:active,
    &:focus {
      box-shadow: ${getTheme((t) => t.color.outline)} 0px 0px 0px 0.2em;
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
      /* margin-bottom: ${getTheme((t) => t.space[2])}; */
    }
  }
`;
