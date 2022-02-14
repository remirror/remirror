import { css } from '@linaria/core';

import { getThemeVar } from './utils';

export const EDITOR = css`
  span.remirror-max-count-exceeded {
    background-color: ${getThemeVar('hue', 'red', 4)};
  }
` as 'remirror-editor';
