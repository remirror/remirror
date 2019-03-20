import { Cast, isFunction, isString, PlainObject, Predicate } from '@remirror/core';
import { Children, isValidElement, ReactNode } from 'react';
import { AttributePropFunction, RenderPropFunction } from './types';

export const isAttributeFunction = Cast<Predicate<AttributePropFunction>>(isFunction);

export const isRenderProp = Cast<Predicate<RenderPropFunction>>(isFunction);

export const isDOMElement = (element: ReactNode) => {
  return isValidElement(element) && isString(element.type);
};

export const getElementProps = (element: JSX.Element): PlainObject & { children: JSX.Element } => {
  return element ? element.props : {};
};

export const uniqueClass = (uid: string, className: string) => `${className}-${uid}`;

/**
 * Utility for properly typechecking static defaultProps for a class component in react.
 */
export const asDefaultProps = <GProps extends {}>() => <GDefaultProps extends Partial<GProps>>(
  defaultProps: GDefaultProps,
): GDefaultProps => defaultProps;

/**
 * Finds a deeply nested child by the key provided.
 *
 * @param children
 * @param key
 */
export const findChildWithKey = (children: ReactNode, key: string): ReactNode => {
  for (const child of Children.toArray(children)) {
    if (!isValidElement(child)) {
      continue;
    }

    if (child.key === key) {
      return child;
    }
    const subChildren = child.props && Cast(child.props).children;

    if (subChildren) {
      return findChildWithKey(subChildren, key);
    }
  }
  return null;
};

/**
 * Searches the react tree for a child node with the requested key and updates
 * it using the updater function once found
 *
 * @param children
 * @param key
 * @param updateFunction
 */
export const updateChildWithKey = (
  children: ReactNode,
  key: string,
  updateFunction: (child: JSX.Element) => JSX.Element,
): ReactNode[] => {
  let keyFound = false;
  return Children.map(children, child => {
    if (keyFound) {
      return child;
    }

    if (!isValidElement(child)) {
      return child;
    }

    if (child.key === key) {
      keyFound = true;
      return updateFunction(child);
    }

    const subChildren = child.props && Cast(child.props).children;
    if (subChildren) {
      return updateChildWithKey(subChildren, key, updateFunction);
    }

    return child;
  });
};
