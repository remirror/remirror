import { IndentLevels } from './paragraph/paragraph-types';

/**
 * The size of the default indentation size (in pt).
 */
export const INDENT_MARGIN_PT_SIZE = 36;

/**
 * The levels of indentation supported by default. Can be overridden.
 */
export const INDENT_LEVELS: IndentLevels = [0, 7];

/**
 * The min indentation level.
 */
export const MIN_INDENT_LEVEL = 0;

/**
 * The default maximum level of indentation allowed.
 */
export const MAX_INDENT_LEVEL = 7;

/**
 * The attribute to use for storing the indent value.
 */
export const INDENT_ATTRIBUTE = 'data-indent';

/**
 * Values which can safely be ignored when styling nodes.
 */
export const EMPTY_CSS_VALUE = new Set(['', '0%', '0pt', '0px']);

/**
 * The default line spacing values.
 */
export const LINE_SPACING_VALUES = [
  '100%',
  '115%',
  '150%', // Default value.
  '200%',
];

/**
 * Regex for accepting a value as a valid alignment name.
 */
export const ALIGN_PATTERN = /(left|right|center|justify)/;

/**
 * Regex for matching sizes in the DOM.
 */
export const SIZE_PATTERN = /([\d\.]+)(px|pt)/i;

/**
 * The default pixel to pt font size ratio.
 *
 * @see https://github.com/chanzuckerberg/czi-prosemirror/blob/52e34840d73fccc46637314bf4b4be71147112d4/src/convertToCSSPTValue.js#L7
 */
export const PIXEL_TO_PT_RATIO = 0.7518796992481203; // 1 / 1.33.

/**
 * The default pt to pixel ratio.
 */
export const PT_TO_PIXEL_RATIO = 1.33;

/**
 * The default font sizes for the editor.
 */
export const FONT_PT_SIZES = [8, 9, 10, 11, 12, 14, 18, 24, 30, 36, 48, 60, 72, 90];

export const CSS_ROTATE_PATTERN = /rotate\(([0-9\.]+)rad\)/i;
