import { clamp } from '@remirror/core';

import {
  INDENT_LEVELS,
  INDENT_MARGIN_PT_SIZE,
  PIXEL_TO_PT_RATIO,
  SIZE_PATTERN,
} from './node-constants';
import { IndentLevels } from './paragraph/paragraph-types';

/**
 * Converts a style value for size into into the same `pt`.
 *
 * TODO is it really important to make fonts print media friendly?
 */
export const convertToPt = (styleValue: string) => {
  const matches = styleValue.match(SIZE_PATTERN);
  if (!matches) {
    return 0;
  }
  let value = parseFloat(matches[1]);
  const unit = matches[2];
  if (!value || !unit) {
    return 0;
  }
  if (unit === 'px') {
    value = PIXEL_TO_PT_RATIO * value;
  }
  return value;
};

/**
 * Converts the left margin into an indentation level.
 */
export const marginToIndent = (marginLeft: string, levels: IndentLevels = INDENT_LEVELS) => {
  const ptValue = convertToPt(marginLeft);
  const min = levels[0];
  const max = levels[1];
  const value = Math.floor(ptValue / INDENT_MARGIN_PT_SIZE);

  return clamp({ min, max, value });
};
