import {
  cloneElement,
  Fragment,
  isValidElement as isValidReactElement,
  ReactElement,
  ReactNode,
} from 'react';
import { ErrorConstant } from '@remirror/core-constants';
import { invariant, isFunction, isObject, isString } from '@remirror/core-helpers';
import type { AnyFunction, UnknownShape } from '@remirror/core-types';

/**
 * A drop in replacement for built in React.isValidElement which accepts a test value of any type
 *
 * @param value - the value to check
 */
export function isValidElement<Props extends object = any>(
  value: unknown,
): value is ReactElement<Props> {
  return isObject(value) && isValidReactElement(value);
}

/**
 * Check whether a react node is a built in dom element (i.e. `div`, `span`)
 *
 * @param value - the value to check
 */
export function isReactDOMElement<Props extends object = any>(
  value: unknown,
): value is ReactElement<Props> & { type: string } {
  return isValidElement(value) && isString(value.type);
}

/**
 * Checks whether the element is a react fragment
 *
 * @param value - the value to check
 */
export function isReactFragment<Props extends object = any>(
  value: unknown,
): value is ReactElement<Props> & { type: typeof Fragment } {
  return isObject(value) && isValidElement(value) && value.type === Fragment;
}

/**
 * Retrieve the element props for JSX Element
 *
 * @param element
 */
export function getElementProps<Type = UnknownShape>(
  element: JSX.Element,
): UnknownShape & Type & { children: JSX.Element } {
  return isValidElement(element) ? element.props : {};
}

/**
 * Will throw an error if the child provided is not a function.
 *
 * @remarks
 * This is currently used in the remirror component to throw an error when the element children
 * are not a render prop. It should be called outside of render for class Components.
 *
 * @param prop - the prop to test
 */
export const propIsFunction = (value: unknown): value is AnyFunction => {
  invariant(isFunction(value), {
    code: ErrorConstant.INTERNAL,
    message: 'The child argument to the Remirror component must be a function.',
  });

  return true;
};

/**
 * Add the specified key to an element when it is a valid react element.
 *
 * This is useful when returning an array of components because a fragment isn't sufficient.
 */
export function addKeyToElement(element: ReactNode, key: string | number): ReactNode {
  if (!isValidElement(element)) {
    return element;
  }

  return cloneElement(element, { ...element.props, key });
}
