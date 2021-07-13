import { DomSizeUnit, ParsedDomSize, Static } from '@remirror/core';

export interface FontSizeOptions {
  /**
   * The default size value.
   *
   * @default ''
   */
  defaultSize?: Static<string>;

  /**
   * The default unit to use for the font sizes.
   *
   * @default 'pt'
   */
  unit?: DomSizeUnit;

  /**
   * The amount to increment the font by when the font size is incremented.
   *
   * A function can be passed if you would like the increment level to be
   * influenced by the current font size. A larger increment can be set for
   * larger sizes.
   *
   * @param parsedSize - the size as a tuple of size and unit.
   * @param direction - `-1` when decreasing the value and `+1` when increasing
   * the value.
   */
  increment?: number | ((parsedSize: ParsedDomSize, direction: -1 | 1) => number);

  /**
   * The maximum font size.
   */
  max?: number;

  /**
   * The minimum font size.
   */
  min?: number;

  /**
   * The nearest multiple to round the font size to. This can be `1` to only
   * accept whole number or `0.5` to accept both whole numbers and numbers
   * ending in `.5`.
   *
   * It is advisable to only set values that produce whole numbers when divided
   * by 1.
   *
   * @default 0.5
   */
  roundingMultiple?: number;
}

export interface FontSizeAttributes {
  /**
   * The font size.
   *
   * @default ''
   */
  size?: string;
}
