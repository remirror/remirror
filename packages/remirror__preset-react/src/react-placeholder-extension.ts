import { Children, cloneElement } from 'react';
import { cx, isDocNodeEmpty, isString } from '@remirror/core';
import { PlaceholderExtension, PlaceholderOptions } from '@remirror/extension-placeholder';
import { SsrTransformer } from '@remirror/extension-react-ssr';
import { getElementProps } from '@remirror/react-utils';

export interface ReactPlaceholderOptions extends PlaceholderOptions {}

/**
 * This is identical to the placeholder extension except that it provides SSR
 * support.
 */
export class ReactPlaceholderExtension extends PlaceholderExtension {
  get name() {
    // This is because of a problem with extending extensions. The name constant
    // can't be changed without a forced cast
    return 'reactPlaceholder' as 'placeholder';
  }

  createSSRTransformer(): SsrTransformer {
    return (element: JSX.Element, state) => {
      state = state ?? this.store.getState();

      const { emptyNodeClass, placeholder } = this.options;
      const { children } = getElementProps(element);

      if (Children.count(children) > 1 || !isDocNodeEmpty(state.doc)) {
        return element;
      }

      const properties = getElementProps(children);
      return cloneElement(
        element,
        {},
        cloneElement(children, {
          placeholder,
          className: cx(isString(properties.className) && properties.className, emptyNodeClass),
          'data-placeholder': placeholder,
        }),
      );
    };
  }
}
