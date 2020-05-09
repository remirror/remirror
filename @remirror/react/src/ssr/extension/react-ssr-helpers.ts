import { Children, cloneElement, createElement, JSXElementConstructor } from 'react';

import { AnyExtension, ManagerMethodParameter, PlainObject } from '@remirror/core';
import { isArray } from '@remirror/core-helpers';

import { getElementProps, isReactDOMElement, isReactFragment } from '../../react-utils';

/**
 * A function that creates the SSR Transformer which will take in the current
 * JSX  and return the new element for Server Side Rendering.
 */
type CreateSSRTransformer = <ExtensionUnion extends AnyExtension>(
  params: ManagerMethodParameter,
  extension: ExtensionUnion,
) => SSRTransformer;

type SSRTransformer = (element: JSX.Element) => JSX.Element;

/**
 * Clone SSR elements ignoring the top level Fragment
 *
 * @remarks
 * A utility method for the SSR JSX
 *
 * @param element - the element to transform which must be from the JSX received in `ssrTransformer`
 * @param transformChildElements - receives the nested elements and props and transforms them into another JSX.Element
 */
const cloneSSRElement = (
  element: JSX.Element,
  transformChildElements: (
    children: JSX.Element | JSX.Element[],
    childrenProps: PlainObject,
  ) => JSX.Element | JSX.Element[],
) => {
  if (!isReactFragment(element)) {
    throw new Error('Invalid element passed. The top level element must be a fragment');
  }

  const { children } = getElementProps(element);
  const childrenProperties = getElementProps(children);

  return cloneElement(element, {}, transformChildElements(children, childrenProperties));
};

/**
 * Returns true when a react element has no children.
 *
 * @param element - the element to test
 */
const elementIsEmpty = (element: JSX.Element) => Children.count(element.props.children) === 0;

/**
 * Checks to see that the element is of the provided type.
 *
 * @param element - the element to test
 * @param type - the type to match
 */
const elementIsOfType = <
  GType extends string | JSXElementConstructor<any> = string | JSXElementConstructor<any>
>(
  element: JSX.Element,
  type: GType,
) => element.type === type;

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
const injectBrIntoEmptyParagraphs: SSRTransformer = (element) => {
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
};

/**
 * The default transformations which are applied when none are passed.
 */
const DEFAULT_TRANSFORMATIONS: SSRTransformer[] = [injectBrIntoEmptyParagraphs];

export { cloneSSRElement, DEFAULT_TRANSFORMATIONS, SSRTransformer, CreateSSRTransformer };
