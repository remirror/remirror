import { PrimitiveSelection, Static, TupleOf } from '@remirror/core';
import { I18n } from '@remirror/i18n';

export interface TextColorAttributes {
  /**
   * The color of the text. This can be a color value like `red` `#fff`
   * `rgb(0,0,0)` or a computed property like `--rmr-color-primary`.
   *
   * @default ''
   */
  color?: string;
}

export interface TextColorOptions {
  /**
   * The default color value.
   *
   * @default 'inherit'
   */
  defaultColor?: Static<string>;

  /**
   * The color palette which is a function that returns a list of colors and
   * labels for help with ui. It is completely optional and you are free to use use whatever colors
   * you choose.
   */
  palette?: Palette;
}

export interface SetTextColorOptions {
  selection?: PrimitiveSelection;
}

export interface ColorWithLabel {
  label: string;
  color: string;
}

export type ColorWithLabelTuple = TupleOf<ColorWithLabel, 10>;

export interface HuePalette {
  label: string;
  hues: ColorWithLabelTuple;
}

export type HuePaletteMap = Record<keyof Remirror.ThemeHue, HuePalette> &
  Record<string, HuePalette>;

export interface ColorPalette {
  black: ColorWithLabel;
  white: ColorWithLabel;
  transparent: ColorWithLabel;
  hues: HuePaletteMap;
}

/**
 * Create a palette the `t` method provided for internalization.
 */
export type Palette = (t: I18n['_']) => ColorPalette;
