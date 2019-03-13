import {
  Cast,
  ObjectNode,
  OffsetCalculator,
  PlainObject,
  Position,
  Predicate,
  ShouldRenderMenu,
} from '@remirror/core';
import is from '@sindresorhus/is';
import { ReactNode } from 'react';
import { AttributePropFunction, RenderPropFunction } from './types';

export const isAttributeFunction = Cast<Predicate<AttributePropFunction>>(is.function_);

export const isRenderProp = Cast<Predicate<RenderPropFunction>>(is.function_);

export const isObjectNode = (arg: unknown): arg is ObjectNode => {
  if (is.plainObject(arg) && arg.type === 'doc') {
    return true;
  }
  return false;
};

export const isDOMElement = (element: ReactNode) => {
  return element && is.string(Cast<JSX.Element>(element).type);
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

export const defaultShouldRender: ShouldRenderMenu = props => props.selection && !props.selection.empty;

export const defaultOffscreenPosition: Position = { left: -1000, top: 0, bottom: 0, right: 0 };

export const uniqueClass = (uid: string, className: string) => `${className}-${uid}`;

/**
 * Utility for properly typechecking static defaultProps for a class component in react.
 */
export const asDefaultProps = <GProps extends {}>() => <GDefaultProps extends Partial<GProps>>(
  defaultProps: GDefaultProps,
): GDefaultProps => defaultProps;
