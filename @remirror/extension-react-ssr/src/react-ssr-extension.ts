import { Children, cloneElement, ComponentType, createElement, JSXElementConstructor } from 'react';

import {
  AnyCombinedUnion,
  CreateLifecycleMethod,
  ExtensionPriority,
  isArray,
  object,
  PlainExtension,
  Shape,
} from '@remirror/core';
import { getElementProps, isReactDOMElement, isReactFragment } from '@remirror/react-utils';

export interface ReactSSROptions {
  /**
   * The transformers that will be automatically used in the editor for properly
   * rendering ssr.
   *
   * @defaultValue `DEFAULT_TRANSFORMATIONS`
   */
  transformers?: SSRTransformer[];
}

/**
 * This extension allows for React based SSR transformations to the editor. It
 * adds a parameter option called `createSSRTransformer` which is used to handle
 * the differences between how prosemirror renders the dom and how it appears in
 * an ssr environment.
 *
 * @remarks
 *
 * There are subtle things that prosemirror does when it loads the document that
 * can cause things to jump around.
 *
 * The aim of this extension is to provide a series of helper transformations
 * which deal with the typical problems that prosemirror presents when rendering
 * on the server. It also allows other extensions to use the
 * `createSSRTransformer` option to handle their own ssr discrepancies.
 *
 * The transformations can also serve as a guideline when creating your own
 * SSRTransforms. However in most cases the defaults should be sufficient.
 */
export class ReactSSRExtension extends PlainExtension<ReactSSROptions> {
  static readonly defaultPriority = ExtensionPriority.High;

  static readonly defaultOptions: Required<ReactSSROptions> = {
    transformers: [injectBrIntoEmptyParagraphs],
  };

  get name() {
    return 'reactSSR' as const;
  }

  onCreate: CreateLifecycleMethod = (extensions) => {
    const components: Record<string, ComponentType<any>> = object();

    const ssrTransformers: Array<() => SSRTransformer> = [];

    const ssrTransformer: SSRTransformer = (initialElement) => {
      let element: JSX.Element = initialElement;

      for (const transformer of ssrTransformers) {
        element = transformer()(element);
      }

      return element;
    };

    for (const extension of extensions) {
      if (
        !this.store.managerSettings.exclude?.reactSSR &&
        extension.createSSRComponent &&
        !extension.options.exclude?.reactSSR
      ) {
        components[extension.name] = extension.createSSRComponent();
      }

      if (extension.createSSRTransformer && !extension.options.exclude?.reactSSR) {
        ssrTransformers.push(extension.createSSRTransformer);
      }
    }

    this.store.setStoreKey('components', components);
    this.store.setStoreKey('ssrTransformer', ssrTransformer);
  };

  /**
   * A function that takes in the initial automatically produced JSX by the
   * ReactSSRSerializer and transforms it into and element that is consistent
   * between the browser and the server.
   */
  createSSRTransformer = () => (initialElement: JSX.Element) => {
    let element: JSX.Element = initialElement;

    for (const transformer of this.options.transformers) {
      element = transformer(element);
    }

    return element;
  };
}

export type SSRTransformer = (element: JSX.Element) => JSX.Element;

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
    childrenProps: Shape,
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
  Type extends string | JSXElementConstructor<any> = string | JSXElementConstructor<any>
>(element: JSX.Element, type: Type) {
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

declare global {
  namespace Remirror {
    interface ExcludeOptions {
      /**
       * Whether to use the SSR component when not in a DOM environment
       *
       * @defaultValue `undefined`
       */
      reactSSR?: boolean;
    }

    interface ManagerStore<Combined extends AnyCombinedUnion> {
      /**
       * The transformer for updating the SSR rendering of the prosemirror state
       * and allowing it to render without defects.
       */
      ssrTransformer: SSRTransformer;

      /**
       * Components for ssr transformations.
       */
      components: Record<string, ComponentType<any>>;
    }

    interface ExtensionCreatorMethods {
      /**
       * A method for transforming the original JSX element received by the
       * extension. This is typically for usage in server side rendered
       * environment.
       *
       * @remarks
       *
       * Some extensions add decorations to the ProsemirrorView based on their
       * state. These decorations can touch any node or mark and it would be
       * very difficult to model this without transforming the complete
       * produced JSX element.
       *
       * An example is that all empty paragraphs in prosemirror automatically
       * have a `<br />` tag injected into them during runtime. The
       * ReactSSRSerializer which transform the `toDOM` method output for paragraph
       * tags `[p, 0]` into JSX `<p />` has no way of knowing about this. That
       * is where this creator method can help. We can transform the
       * automatically generated JSX and inject `<br />` tags for the initial
       * server render. That way there is no jump or layout adjustment when the
       * document first loads on the browser.
       */
      createSSRTransformer?: () => SSRTransformer;

      /**
       * A function that returns the component that will be used to render in
       * SSR.
       *
       * Use this if the automatic componentization in ReactSerializer of the
       * `toDOM` method doesn't produce the expected results in SSR.
       *
       * TODO move this into a seperate NodeExtension and MarkExtension based
       * merged interface so that the props can be specified as `{ mark: Mark }`
       * or `{ node: ProsemirrorNode }`.
       */
      createSSRComponent?: () => ComponentType<any>;
    }
  }
}
