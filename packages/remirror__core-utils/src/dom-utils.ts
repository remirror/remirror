import { Cast, includes, isNumber, isObject, isString } from '@remirror/core-helpers';
import { KebabCase, StringKey } from '@remirror/core-types';

/**
 * Get the styles for a given property of an element.
 */
export function getStyle(
  element: HTMLElement,
  property: KebabCase<StringKey<CSSStyleDeclaration>>,
): string {
  const view = element.ownerDocument?.defaultView ?? window;
  const style = view.getComputedStyle(element);
  return style.getPropertyValue(property);
}

export const DOM_SIZE_UNITS = [
  'px',
  'rem',
  'em',
  'in',
  'q',
  'mm',
  'cm',
  'pt',
  'pc',
  'vh',
  'vw',
  'vmin',
  'vmax',
] as const;

export type DomSizeUnit = typeof DOM_SIZE_UNITS[number];

/**
 * A tuple for the font size and unit.
 */
export type ParsedDomSize = [size: number, unit: DomSizeUnit];

/**
 * Parse the font size and font unit from the provided value. When the value
 * type is unsupported it default to `px`.
 */
export function parseSizeUnit(fontSize: string | undefined | null = '0'): ParsedDomSize {
  const length = fontSize || '0';
  const value = Number.parseFloat(length);
  const match = length.match(/[\d-.]+(\w+)$/);
  const unit = (match?.[1] ?? 'px').toLowerCase(); // Defaults to pixels

  return [value, includes(DOM_SIZE_UNITS, unit) ? unit : 'px'];
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
export function extractPixelSize(size: string, element?: Element | null): number {
  const view = element?.ownerDocument?.defaultView ?? window;
  const root = view.document.documentElement || view.document.body;
  const [value, unit] = parseSizeUnit(size);

  switch (unit) {
    case 'rem':
      return value * extractPixelSize(getFontSize(root));
    case 'em':
      return value * extractPixelSize(getFontSize(element), element?.parentElement);
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
export function convertPixelsToDomUnit(
  size: string,
  to: DomSizeUnit,
  element?: Element | null,
): number {
  const view = element?.ownerDocument?.defaultView ?? window;
  const root = view.document.documentElement || view.document.body;
  const pixelValue = extractPixelSize(size, element);

  switch (to) {
    case 'px':
      return pixelValue;
    case 'rem':
      return pixelValue / extractPixelSize(getFontSize(root));
    case 'em':
      return pixelValue * extractPixelSize(getFontSize(element), element?.parentElement);
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

/**
 * Checks whether the passed value is a valid dom node
 *
 * @param domNode - the dom node
 */
export function isDomNode(domNode: unknown): domNode is Node {
  return isObject(Node)
    ? domNode instanceof Node
    : isObject(domNode) && isNumber(Cast(domNode).nodeType) && isString(Cast(domNode).nodeName);
}

/**
 * Checks for an element node like `<p>` or `<div>`.
 *
 * @param domNode - the dom node
 */
export function isElementDomNode(domNode: unknown): domNode is HTMLElement {
  return isDomNode(domNode) && domNode.nodeType === Node.ELEMENT_NODE;
}

/**
 * Checks for a text node.
 *
 * @param domNode - the dom node
 */
export function isTextDomNode(domNode: unknown): domNode is Text {
  return isDomNode(domNode) && domNode.nodeType === Node.TEXT_NODE;
}
