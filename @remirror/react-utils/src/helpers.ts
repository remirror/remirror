import { jsx } from '@emotion/core';
import {
  bool,
  Cast,
  isArray,
  isFunction,
  isObject,
  isString,
  PlainObject,
  uniqueArray,
} from '@remirror/core';
import { Children, isValidElement, ReactNode } from 'react';
import { RemirrorComponentType, RemirrorElement, RemirrorElementType } from './types';

/**
 * Check whether a react node is a built in dom element (i.e. `div`, `span`)
 *
 * @param element
 */
export const isReactDOMElement = (element: ReactNode) => {
  return isValidElement(element) && isString(element.type);
};

/**
 * Retrieve the element props for JSX Element
 *
 * @param element
 */
export const getElementProps = (element: JSX.Element): PlainObject & { children: JSX.Element } => {
  return element ? element.props : {};
};

/**
 * Utility for generating a unique class name
 *
 * @param uid
 * @param className
 */
export const uniqueClass = (uid: string, className: string) => `${className}-${uid}`;

/**
 * Utility for properly typechecking static defaultProps for a class component in react.
 *
 * ```ts
 * static defaultProps = asDefaultProps<RemirrorProps>()({
 *   initialContent: EMPTY_OBJECT_NODE,
 * });
 * ```
 */
export const asDefaultProps = <GProps extends {}>() => <GDefaultProps extends Partial<GProps>>(
  props: GDefaultProps,
): GDefaultProps => props;

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

/**
 * Checks if this element has a type of any RemirrorComponent
 *
 * @param value - the value to check
 */
export const isRemirrorElement = <GOptions extends {} = any>(
  value: unknown,
): value is RemirrorElement<GOptions> => {
  return bool(
    isObject(value) &&
      isValidElement(value) &&
      (value.type as RemirrorComponentType<GOptions>).$$remirrorType,
  );
};

const isRemirrorElementOfType = (type: RemirrorElementType) => <GOptions extends {} = any>(
  value: unknown,
): value is RemirrorElement<GOptions> => isRemirrorElement(value) && value.type.$$remirrorType === type;

/**
 * Checks if this is a RemirrorExtension type. These are used to configure the extensions that determine
 * the underlying behaviour of the editor.
 *
 * @param value - the value to check
 */
export const isRemirrorExtension = isRemirrorElementOfType(RemirrorElementType.Extension);

/**
 * Finds if this is a RemirrorProvider (which provides the RemirrorInjectedProps into the context);
 *
 * @param value - the value to check
 */
export const isRemirrorProvider = isRemirrorElementOfType(RemirrorElementType.EditorProvider);

/**
 * Checks if this is a ManagedRemirrorProvider which pulls in the manager from the context and places it's children
 * inside the RemirrorProvider
 *
 * @param value - the value to check
 */
export const isManagedRemirrorProvider = isRemirrorElementOfType(RemirrorElementType.ManagedEditorProvider);

/**
 * Clones an element while also enabling the css prop on jsx elements at the same time.
 * This is used for emotion which needs to inject the css property which React.cloneElement doesn't do.
 *
 * @param element - the element to clone
 * @param props - the props to pass through to the cloned element
 * @param rest - the children of the cloned element
 *
 * @returns a cloned react element with builtin support for the emotion `css` props
 */
export const cloneElement = (element: any, props: any, ...rest: ReactNode[]) => {
  const children = uniqueArray([
    ...(isArray(props.children) ? props.children : props.children ? [props.children] : []),
    ...(isArray(rest) ? rest : rest ? [rest] : []),
  ]);

  return jsx(
    element.type,
    {
      key: element.key,
      ref: element.ref,
      ...element.props,
      ...props,
    },
    ...children,
  );
};

/**
 * Will throw an error if the child provided is not a function.
 */
export function childIsFunction(children: unknown) {
  if (!isFunction(children)) {
    throw new Error('The child argument to the Remirror component must be a function.');
  }
}
