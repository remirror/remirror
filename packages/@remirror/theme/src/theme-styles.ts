import { css } from 'linaria';

import { createThemeVariables, defaultRemirrorTheme, getTheme } from './theme';

/**
 * The class name for adding theme styles to the remirror editor.
 *
 * These are the variable names
 */
export const themeStyles = css`
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
`;
