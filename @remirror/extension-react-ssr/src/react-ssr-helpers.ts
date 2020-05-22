import { Children, cloneElement, createElement, JSXElementConstructor, ReactElement } from 'react';

import { AnyExtension, ExtensionStore, isArray, isString, PlainObject } from '@remirror/core';
import { getElementProps, isReactDOMElement, isReactFragment } from '@remirror/react-utils';

/**
 * A function that creates the SSR Transformer which will take in the current
 * JSX  and return the new element for Server Side Rendering.
 */
type CreateSSRTransformer = <ExtensionUnion extends AnyExtension>(
  params: ExtensionStore,
  extension: ExtensionUnion,
) => SSRTransformer;

type SSRTransformer = (element: JSX.Element) => JSX.Element;

/**
 * Check whether a react node is a built in dom element (i.e. `div`, `span`)
 *
 * @param value - the value to check
 */
export function isReactDOMElement<GProps extends object = any>(
  value: unknown,
): value is ReactElement<GProps> & { type: string } {
  return isElement(value) && isString(value.type);
}

/**
 * Clone SSR elements ignoring the top level Fragment
 *
 * @remarks
 * A utility method for the SSR JSX
 *
 * @param element - the element to transform which must be from the JSX received in `ssrTransformer`
 * @param transformChildElements - receives the nested elements and props and transforms them into another JSX.Element
 */
function cloneSSRElement(
  element: JSX.Element,
  transformChildElements: (
    children: JSX.Element | JSX.Element[],
    childrenProps: PlainObject,
  ) => JSX.Element | JSX.Element[],
) {
  if (!isReactFragment(element)) {
    throw new Error('Invalid element passed. The top level element must be a fragment');
  }

  const { children } = getElementProps(element);
  const childrenProperties = getElementProps(children);

  return cloneElement(element, {}, transformChildElements(children, childrenProperties));
}

/**
 * Returns true when a react element has no children.
 *
 * @param element - the element to test
 */
function elementIsEmpty(element: JSX.Element) {
  return Children.count(element.props.children) === 0;
}

/**
 * Checks to see that the element is of the provided type.
 *
 * @param element - the element to test
 * @param type - the type to match
 */
function elementIsOfType<
  GType extends string | JSXElementConstructor<any> = string | JSXElementConstructor<any>
>(element: JSX.Element, type: GType) {
  return element.type === type;
}

/**
 * This utility maps through the SSR element and injects break tags into all
 * empty p tags.
 *
 * @remarks
 *
 * Prosemirror automatically injects break tags into empty paragraph tags. This
 * causes the document rendered during SSR to be different than when the page
 * loads.
 */
function injectBrIntoEmptyParagraphs(element: JSX.Element) {
  return cloneSSRElement(element, (children) => {
    if (!isArray(children)) {
      return children;
    }

    return Children.map(children, (child) => {
      if (!(isReactDOMElement(child) && elementIsEmpty(child) && elementIsOfType(child, 'p'))) {
        return child;
      }

      const properties = getElementProps(child);
      return cloneElement(child, properties, createElement('br'));
    });
  });
}

/**
 * The default transformations which are applied when none are passed.
 */
const DEFAULT_TRANSFORMATIONS: SSRTransformer[] = [injectBrIntoEmptyParagraphs];

export { cloneSSRElement, DEFAULT_TRANSFORMATIONS, SSRTransformer, CreateSSRTransformer };
