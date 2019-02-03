import { Literal, ObjectNode, OffsetCalculator, Position, ShouldRenderMenu } from '@remirror/core';
import { isFunction, isPlainObject, isString } from 'lodash';
import { ReactNode } from 'react';
import { PlainObject } from 'simplytyped';
import { AttributePropFunction, RenderPropFunction } from './types';

/**
 * Type cast an argument
 * @param arg
 */
export const Cast = <GType = any>(arg: any): GType => arg;

/**
 * Use this to create a Tuple with args that can be used as a type
 *
 * @example
 * ```
 * const ALL_SUITS = tuple('hearts', 'diamonds', 'spades', 'clubs');
 * type SuitTuple = typeof ALL_SUITS;
 * type Suit = SuitTuple[number]; // union type
 * ```
 * @param args
 */
export const tuple = <GType extends Literal[]>(...args: GType) => args;

export const isAttributeFunction = (arg: unknown): arg is AttributePropFunction => isFunction(arg);
export const isRenderProp = (arg: unknown): arg is RenderPropFunction => isFunction(arg);
export const isObjectNode = (arg: unknown): arg is ObjectNode => {
  if (isPlainObject(arg) && Cast(arg).type === 'doc') {
    return true;
  }
  return false;
};
export const isDOMElement = (element: ReactNode) => {
  return element && isString(Cast<JSX.Element>(element).type);
};
export const getElementProps = (element: JSX.Element): PlainObject => {
  return element.props;
};

export const baseOffsetCalculator: Required<OffsetCalculator> = {
  top: () => 0,
  left: () => 0,
  right: () => 0,
  bottom: () => 0,
};

export const simpleOffsetCalculator: OffsetCalculator = {
  left: props => props.left,
  top: props => props.top,
  right: props => props.right,
  bottom: props => props.bottom,
};

export const defaultShouldRender: ShouldRenderMenu = props =>
  props.selection && !props.selection.empty;
export const defaultOffscreenPosition: Position = { left: -1000, top: 0, bottom: 0, right: 0 };

/**
 * We need to translate the co-ordinates because `coordsAtPos` returns co-ordinates
 * relative to `window`. And, also need to adjust the cursor container height.
 * (0, 0)
 * +--------------------- [window] ---------------------+
 * |   (left, top) +-------- [Offset Parent] --------+  |
 * | {coordsAtPos} | [Cursor]   <- cursorHeight      |  |
 * |               | [FloatingToolbar]               |  |
 */
export const getAbsoluteCoordinates = (
  coords: Position,
  offsetParent: Element,
  cursorHeight: number,
) => {
  const {
    left: offsetParentLeft,
    top: offsetParentTop,
    height: offsetParentHeight,
  } = offsetParent.getBoundingClientRect();

  return {
    left: coords.left - offsetParentLeft,
    right: coords.right - offsetParentLeft,
    top: coords.top - (offsetParentTop - cursorHeight) + offsetParent.scrollTop,
    bottom:
      offsetParentHeight - (coords.top - (offsetParentTop - cursorHeight) - offsetParent.scrollTop),
  };
};

export const getNearestNonTextNode = (node: Node) =>
  node.nodeType === Node.TEXT_NODE ? (node.parentNode as HTMLElement) : (node as HTMLElement);
