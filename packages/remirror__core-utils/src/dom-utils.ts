import parse from 'parenthesis';
import { clamp, findMatches, includes, isNumber, isObject, isString } from '@remirror/core-helpers';
import { KebabCase, StringKey } from '@remirror/core-types';

import { getMatchString, getWindowFromElement, maybeGetWindowFromElement } from './core-utils';

/**
 * Dom Node type. See https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeType
 *
 * We use our own enum instead of the global `Node` object to be more compatible with server
 * environments.
 *
 * @internal
 */
const enum DomNodeType {
  ELEMENT_NODE = 1,
  ATTRIBUTE_NODE = 2,
  TEXT_NODE = 3,
  CDATA_SECTION_NODE = 4,
  ENTITY_REFERENCE_NODE = 5,
  ENTITY_NODE = 6,
  PROCESSING_INSTRUCTION_NODE = 7,
  COMMENT_NODE = 8,
  DOCUMENT_NODE = 9,
  DOCUMENT_TYPE_NODE = 10,
  DOCUMENT_FRAGMENT_NODE = 11,
  NOTATION_NODE = 12,
}

/**
 * Get the styles for a given property of an element.
 */
export function getStyle(
  element: HTMLElement,
  property: KebabCase<StringKey<CSSStyleDeclaration>>,
): string {
  const view = maybeGetWindowFromElement(element);
  return view?.getComputedStyle(element)?.getPropertyValue(property) ?? '';
}

/**
 * Set more styles to the given element.
 */
export function setStyle(
  target: HTMLElement,
  styles: Partial<CSSStyleDeclaration>,
): Partial<CSSStyleDeclaration> {
  return Object.assign(target.style, styles);
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

export type DomSizeUnit = (typeof DOM_SIZE_UNITS)[number];

/**
 * A tuple for the font size and unit.
 */
export type ParsedDomSize = [size: number, unit: DomSizeUnit];

/**
 * Matches a CSS dimension returning a group containing the unit name
 * i.e. '10rem' returns the group 'rem'
 */
const CSS_DIMENSION_REGEX = /[\d-.]+(\w+)$/;

/**
 * Parse the font size and font unit from the provided value. When the value
 * type is unsupported it default to `px`.
 */
export function parseSizeUnit(fontSize: string | undefined | null = '0'): ParsedDomSize {
  const length = fontSize || '0';
  const value = Number.parseFloat(length);
  const match = length.match(CSS_DIMENSION_REGEX);
  const unit = (match?.[1] ?? 'px').toLowerCase(); // Defaults to pixels

  return [value, includes(DOM_SIZE_UNITS, unit) ? unit : 'px'];
}

const PIXELS_PER_INCH = 96;
const MILLIMETERS_PER_INCH = 25.4;
const POINTS_PER_INCH = 72;
const PICAS_PER_INCH = 6;

export function getFontSize(element?: Element | null): string {
  if (isElementDomNode(element)) {
    return getStyle(element, 'font-size') || getFontSize(element.parentElement);
  }

  const view = maybeGetWindowFromElement(element);
  return view ? getStyle(view.document.documentElement, 'font-size') : '';
}

type UnitConvertor = (value: number, unit: string) => number;

function createUnitConverter(element?: Element | null): UnitConvertor {
  const view = getWindowFromElement(element);
  const root = view.document.documentElement || view.document.body;

  return (value: number, unit: string) => {
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
  };
}

/**
 * Matches a CSS function returning groups containing the function name and arguments
 * i.e. 'min(10px, 20px)' returns groups 'min' and '10px, 20px'
 */
const CSS_FUNCTION_REGEX = /^([a-z]+)\((.+)\)$/i;

/**
 * Recursively evaluates CSS functions by parsing into bracket groups
 *
 * Does not support the `calc` function
 *
 * @param cssFunc a string matching CSS_FUNCTION_REGEX
 * @param unitConvertor
 */
function parseCSSFunction(cssFunc: string, unitConvertor: UnitConvertor): number {
  if (!CSS_FUNCTION_REGEX.test(cssFunc)) {
    return Number.NaN;
  }

  const tokens = parse(cssFunc, {
    brackets: ['()'],
    escape: '_',
    flat: true,
  });

  if (!tokens || tokens.length === 0) {
    return Number.NaN;
  }

  function replaceTokenReferences(str: string): string {
    return str.replace(/_(\d+)_/g, (_, refIndex: string) => {
      const tokenIndex = Number.parseFloat(refIndex);
      return tokens[tokenIndex] ?? '';
    });
  }

  const firstToken = getMatchString(tokens, 0);

  for (const match of findMatches(firstToken, CSS_FUNCTION_REGEX)) {
    const funcName = getMatchString(match, 1);
    const funcArgs = replaceTokenReferences(getMatchString(match, 2));
    const args = funcArgs.split(/\s*,\s*/);

    const values = args.map((arg) => {
      if (CSS_FUNCTION_REGEX.test(arg)) {
        const nestedFunction = replaceTokenReferences(arg);
        return parseCSSFunction(nestedFunction, unitConvertor);
      }

      return parseCSSDimension(arg, unitConvertor);
    });

    switch (funcName) {
      case 'min':
        return Math.min(...values);
      case 'max':
        return Math.max(...values);
      case 'clamp': {
        const [min, value, max] = values;

        if (isNumber(min) && isNumber(value) && isNumber(max)) {
          return clamp({ min, max, value });
        }

        break;
      }
      case 'calc':
        // Not practical to implement calc due to the vast amount of operations possible
        return Number.NaN;
      default:
        return Number.NaN;
    }
  }

  return Number.NaN;
}

function parseCSSDimension(dimension: string, unitConvertor: UnitConvertor): number {
  const [value, unit] = parseSizeUnit(dimension);
  return unitConvertor(value, unit);
}

/**
 * Extract the pixel value from a dimension string or CSS function.
 *
 * Supports the CSS functions `min`, `max` and `clamp` even when nested.
 *
 * Does not support percentage units or the `calc` function.
 *
 * Adapted from https://github.com/PacoteJS/pacote/blob/20cb1e3a999ed47a8d52b03b750290cf36b8e270/packages/pixels/src/index.ts
 */
export function extractPixelSize(size: string, element?: Element | null): number {
  const unitConvertor = createUnitConverter(element);

  return CSS_FUNCTION_REGEX.test(size)
    ? parseCSSFunction(size.toLowerCase(), unitConvertor)
    : parseCSSDimension(size, unitConvertor);
}

/**
 * Convert the received font size to a valid unit
 */
export function convertPixelsToDomUnit(
  size: string,
  to: DomSizeUnit,
  element?: Element | null,
): number {
  const view = getWindowFromElement(element);
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
  return isObject(domNode) && isNumber(domNode.nodeType) && isString(domNode.nodeName);
}

/**
 * Checks for an element node like `<p>` or `<div>`.
 *
 * @param domNode - the dom node
 */
export function isElementDomNode(domNode: unknown): domNode is HTMLElement {
  return isDomNode(domNode) && domNode.nodeType === DomNodeType.ELEMENT_NODE;
}

/**
 * Checks for a text node.
 *
 * @param domNode - the dom node
 */
export function isTextDomNode(domNode: unknown): domNode is Text {
  return isDomNode(domNode) && domNode.nodeType === DomNodeType.TEXT_NODE;
}

/**
 * Merge two DOMRect objects into a one big DOMRect object that contains both two DOMRect objects.
 *
 * @param rect1 - the first DOMRect
 * @param rect2 - the second DOMRect
 */
export function mergeDOMRects(rect1: DOMRect, rect2: DOMRect): DOMRect {
  const left = Math.min(rect1.left, rect2.left);
  const right = Math.max(rect1.right, rect2.right);
  const top = Math.min(rect1.top, rect2.top);
  const bottom = Math.max(rect1.bottom, rect2.bottom);
  const width = right - left;
  const height = bottom - top;
  return new DOMRect(left, top, width, height);
}
