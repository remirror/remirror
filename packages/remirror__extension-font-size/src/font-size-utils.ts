import { getStyle, includes, isElementDomNode } from '@remirror/core';
import { ExtensionFontSizeMessages as Messages } from '@remirror/messages';

import { FONT_SIZE_UNITS, FontSizeUnit, ParsedFontSize } from './font-size-types';

export const setFontSizeOptions: Remirror.CommandDecoratorOptions = {
  icon: 'fontSize',
  description: ({ t }) => t(Messages.SET_DESCRIPTION),
  label: ({ t }) => t(Messages.SET_LABEL),
};

export const increaseFontSizeOptions: Remirror.CommandDecoratorOptions = {
  icon: 'addLine',
  description: ({ t }) => t(Messages.INCREASE_DESCRIPTION),
  label: ({ t }) => t(Messages.INCREASE_LABEL),
};

export const decreaseFontSizeOptions: Remirror.CommandDecoratorOptions = {
  icon: 'subtractLine',
  description: ({ t }) => t(Messages.DECREASE_DESCRIPTION),
  label: ({ t }) => t(Messages.DECREASE_LABEL),
};

export const FONT_SIZE_ATTRIBUTE = 'data-font-size-mark';

/**
 * Parse the font size and font unit from the provided value. When the value
 * type is unsupported it default to `px`.
 */
export function parseFontSize(fontSize: string | undefined | null = '0'): ParsedFontSize {
  const length = fontSize || '0';
  const value = Number.parseFloat(length);
  const match = length.match(/[\d-.]+(\w+)$/);
  const unit = (match?.[1] ?? 'px').toLowerCase(); // Defaults to pixels

  return [value, includes(FONT_SIZE_UNITS, unit) ? unit : 'px'];
}

const PIXELS_PER_INCH = 96;
const MILLIMETERS_PER_INCH = 25.4;
const POINTS_PER_INCH = 72;
const PICAS_PER_INCH = 6;

export function getFontSize(element?: Element | null): string {
  return isElementDomNode(element)
    ? getStyle(element, 'font-size') || getFontSize(element.parentElement)
    : getStyle(window.document.documentElement, 'font-size');
}

/**
 * Extract the pixel value from a size string.
 *
 * Taken from https://github.com/PacoteJS/pacote/blob/20cb1e3a999ed47a8d52b03b750290cf36b8e270/packages/pixels/src/index.ts
 */
export function pixels(size: string, element?: Element | null): number {
  const view = element?.ownerDocument?.defaultView ?? window;
  const root = view.document.documentElement || view.document.body;
  const [value, unit] = parseFontSize(size);

  switch (unit) {
    case 'rem':
      return value * pixels(getFontSize(root));
    case 'em':
      return value * pixels(getFontSize(element), element?.parentElement);
    case 'in':
      return value * PIXELS_PER_INCH;
    case 'q':
      return (value * PIXELS_PER_INCH) / MILLIMETERS_PER_INCH / 4;
    case 'mm':
      return (value * PIXELS_PER_INCH) / MILLIMETERS_PER_INCH;
    case 'cm':
      return (value * PIXELS_PER_INCH * 10) / MILLIMETERS_PER_INCH;
    case 'pt':
      return (value * PIXELS_PER_INCH) / POINTS_PER_INCH;
    case 'pc':
      return (value * PIXELS_PER_INCH) / PICAS_PER_INCH;
    case 'vh':
      return (value * view.innerHeight || root.clientWidth) / 100;
    case 'vw':
      return (value * view.innerWidth || root.clientHeight) / 100;
    case 'vmin':
      return (
        (value *
          Math.min(view.innerWidth || root.clientWidth, view.innerHeight || root.clientHeight)) /
        100
      );
    case 'vmax':
      return (
        (value *
          Math.max(view.innerWidth || root.clientWidth, view.innerHeight || root.clientHeight)) /
        100
      );
    default:
      return value;
  }
}

/**
 * Convert the received font size to a valid unit
 */
export function convertFontSizeUnit(
  size: string,
  to: FontSizeUnit,
  element?: Element | null,
): number {
  const view = element?.ownerDocument?.defaultView ?? window;
  const root = view.document.documentElement || view.document.body;
  const pixelValue = pixels(size, element);

  switch (to) {
    case 'px':
      return pixelValue;
    case 'rem':
      return pixelValue / pixels(getFontSize(root));
    case 'em':
      return pixelValue * pixels(getFontSize(element), element?.parentElement);
    case 'in':
      return pixelValue / PIXELS_PER_INCH;
    case 'q':
      return (pixelValue / PIXELS_PER_INCH) * MILLIMETERS_PER_INCH * 4;
    case 'mm':
      return (pixelValue / PIXELS_PER_INCH) * MILLIMETERS_PER_INCH;
    case 'cm':
      return (pixelValue / PIXELS_PER_INCH / 10) * MILLIMETERS_PER_INCH;
    case 'pt':
      return (pixelValue / PIXELS_PER_INCH) * POINTS_PER_INCH;
    case 'pc':
      return (pixelValue / PIXELS_PER_INCH) * PICAS_PER_INCH;
    case 'vh':
      return (pixelValue / (view.innerHeight || root.clientWidth)) * 100;
    case 'vw':
      return (pixelValue / (view.innerWidth || root.clientHeight)) * 100;
    case 'vmin':
      return (
        (pixelValue /
          Math.min(view.innerWidth || root.clientWidth, view.innerHeight || root.clientHeight)) *
        100
      );
    case 'vmax':
      return (
        (pixelValue /
          Math.max(view.innerWidth || root.clientWidth, view.innerHeight || root.clientHeight)) *
        100
      );
    default:
      return pixelValue;
  }
}
