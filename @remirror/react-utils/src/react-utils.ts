import { css as emotionCss, jsx } from '@emotion/core';
import { bool, isArray, isFunction, isObject, isString, uniqueArray } from '@remirror/core-helpers';
import { AnyFunction, PlainObject } from '@remirror/core-types';
import {
  Children,
  ComponentClass,
  ComponentType,
  FC,
  Fragment,
  isValidElement as reactIsValidElement,
  LegacyRef,
  PropsWithChildren,
  ReactElement,
  ReactNode,
} from 'react';

export interface RemirrorComponentStaticProperties {
  /**
   * Identifies this as a remirror specific component
   */
  $$remirrorType: RemirrorType;
}

export type RemirrorFC<P extends object = {}> = FC<P> & RemirrorComponentStaticProperties;
export type RemirrorComponentClass<P extends object = {}> = ComponentClass<P> &
  RemirrorComponentStaticProperties;

export interface RemirrorManagerProps {
  /**
   * Whether to use base extensions
   */
  useBaseExtensions?: boolean;
}

export type RemirrorComponentType<P extends object = {}> = ComponentType<P> &
  RemirrorComponentStaticProperties;
export type RemirrorElement<GOptions extends object = any> = ReactElement & {
  type: RemirrorComponentType<GOptions>;
};

/**
 * These are the constants used to determine whether an element is a remirror constant.
 */
export enum RemirrorType {
  Extension = 'extension',
  SSR = 'ssr',
  EditorProvider = 'editor-provider',
  ManagedEditorProvider = 'managed-editor-provider',
  Editor = 'editor',
  Manager = 'manager',
  ManagerProvider = 'manager-provider',
  /**
   * Used to identify the ContextProviderWrapper
   */
  ContextProvider = 'context-provider',
}

/**
 * A drop in replacement for built in React.isValidElement which accepts a test value of any type
 *
 * @param value - the value to check
 */
export const isValidElement = <GProps extends object = any>(value: unknown): value is ReactElement<GProps> =>
  isObject(value) && reactIsValidElement(value);

/**
 * Check whether a react node is a built in dom element (i.e. `div`, `span`)
 *
 * @param value - the value to check
 */
export const isReactDOMElement = <GProps extends object = any>(
  value: unknown,
): value is ReactElement<GProps> & { type: string } => {
  return isValidElement(value) && isString(value.type);
};

/**
 * Checks whether the element is a react fragment
 *
 * @param value - the value to check
 */
export const isReactFragment = <GProps extends object = any>(
  value: unknown,
): value is ReactElement<GProps> & { type: typeof Fragment } =>
  isObject(value) && isValidElement(value) && value.type === Fragment;

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
 *   initialContent: EMPTY_PARAGRAPH_NODE,
 * });
 * ```
 */
export const asDefaultProps = <GProps extends object>() => <GDefaultProps extends Partial<GProps>>(
  props: GDefaultProps,
): GDefaultProps => props;

/**
 * Checks if this element has a type of any RemirrorComponent
 *
 * @param value - the value to check
 */
export const isRemirrorElement = <GOptions extends object = any>(
  value: unknown,
): value is RemirrorElement<GOptions> => {
  return bool(
    isObject(value) &&
      isValidElement(value) &&
      (value.type as RemirrorComponentType<GOptions>).$$remirrorType,
  );
};

const isRemirrorElementOfType = (type: RemirrorType) => <GOptions extends object = any>(
  value: unknown,
): value is RemirrorElement<GOptions> => isRemirrorElement(value) && value.type.$$remirrorType === type;

/**
 * Checks to see if this is the wrapper we've created around the RemirrorContent.Provider component.
 *
 * This is used to help determine how the Remirror component will be rendered. `getRootProps` is the main reason
 * for this, and I'm not even sure the effort is worth it.
 *
 * @param value - the value to check
 */
export const isRemirrorContextProvider = isRemirrorElementOfType(RemirrorType.ContextProvider);

/**
 * Checks if this is a RemirrorExtension type. These are used to configure the extensions that determine
 * the underlying behaviour of the editor.
 *
 * @param value - the value to check
 */
export const isRemirrorExtension = isRemirrorElementOfType(RemirrorType.Extension);

/**
 * Finds if this is a RemirrorProvider (which provides the RemirrorInjectedProps into the context);
 *
 * @param value - the value to check
 */
export const isRemirrorProvider = isRemirrorElementOfType(RemirrorType.EditorProvider);

/**
 * Checks if this is a ManagedRemirrorProvider which pulls in the manager from the context and places it's children
 * inside the RemirrorProvider
 *
 * @param value - the value to check
 */
export const isManagedRemirrorProvider = isRemirrorElementOfType(RemirrorType.ManagedEditorProvider);

/**
 * Clones an element while also enabling the css prop on jsx elements at the same time.
 * This is used for emotion which needs to inject the css property which React.cloneElement doesn't support.
 *
 * @param element - the element to clone
 * @param props - the props to pass through to the cloned element
 * @param rest - the children of the cloned element
 *
 * @returns a cloned react element with builtin support for the emotion `css` props
 */
export const cloneElement = <GProps extends PropsWithChildren<{ ref?: LegacyRef<any> }> = any>(
  element: ReactElement<GProps>,
  props: GProps,
  ...rest: ReactNode[]
) => {
  const children = uniqueArray([
    ...(isArray(props.children) ? props.children : props.children ? [props.children] : []),
    ...(isArray(rest) ? rest : rest ? [rest] : []),
  ]);

  return jsx(
    element.type,
    {
      key: element.key,
      ref: element.props.ref,
      ...element.props,
      ...props,
    },
    ...children,
  );
};

/**
 * Will throw an error if the child provided is not a function.
 *
 * @remarks
 * This is currently used in the remirror component to throw an error when the element children
 * are not a render prop. It should be called outside of render for class Components.
 *
 * @param prop - the prop to test
 */
export const propIsFunction = (prop: unknown): prop is AnyFunction => {
  if (!isFunction(prop)) {
    throw new Error('The child argument to the Remirror component must be a function.');
  }
  return true;
};

/**
 * A noop function that mimics the css emotion call but renders no output.
 *
 * @remarks
 * This is useful for enabling the library user to switch off emotion for core react elements.
 */
export const cssNoOp: typeof emotionCss = () => undefined as any;

/**
 * A css function that just returns the string.
 * This is typically used for css syntax highlighting of plain strings in editors.
 */
export const css = String.raw || ((template: TemplateStringsArray) => template[0]);

/**
 * A drop in replacement for React.Children.only which provides more readable errors
 * when the child is not a react element or undefined.
 */
export const oneChildOnly = <GProps extends object = any>(value: unknown): ReactElement<GProps> => {
  if (!value) {
    throw new Error('This component requires ONE child component - Nothing was provided');
  }

  if (!isValidElement(value)) {
    throw new Error('This component requires ONE child component - An invalid element was provided');
  }

  return Children.only(value);
};

/**
 * Add the specified key to an element when it is a valid react element.
 *
 * This is useful when returning an array of components because a fragment isn't sufficient.
 */
export const addKeyToElement = (element: ReactNode, key: string | number) => {
  if (!isValidElement(element)) {
    return element;
  }

  return cloneElement(element, { ...element.props, key });
};
