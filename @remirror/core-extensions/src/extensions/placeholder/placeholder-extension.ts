import { Extension } from '@remirror/core';
import { ExtensionManagerParams, Plugin } from '@remirror/core-types';
import { isDocNodeEmpty } from '@remirror/core-utils';
import { cloneElement, getElementProps } from '@remirror/react-utils';
import { Children } from 'react';
import { EMPTY_NODE_CLASS_NAME } from '../../core-extension-constants';
import { PlaceholderExtensionOptions, PlaceholderPluginState } from '../../core-extension-types';
import { createPlaceholderPlugin } from './placeholder-plugin';

export class PlaceholderExtension extends Extension<PlaceholderExtensionOptions> {
  get name() {
    return 'placeholder' as const;
  }

  get defaultOptions() {
    return {
      emptyNodeClass: EMPTY_NODE_CLASS_NAME,
      placeholderStyles: {},
      placeholder: '',
    };
  }

  public styles() {
    const selector = `.${this.options.emptyNodeClass}:first-of-type::before`;
    return [
      `
       ${selector} {
        position: absolute;
        color: #aaa;
        pointer-events: none;
        height: 0;
        font-style: italic;
        content: attr(data-placeholder);
      }
    `,
      { [selector]: this.options.placeholderStyle },
    ];
  }

  public plugin(): Plugin<PlaceholderPluginState> {
    return createPlaceholderPlugin(this);
  }

  /**
   * When the view becomes available set the aria placeholder property.
   */
  public attributes() {
    return { 'aria-placeholder': this.options.placeholder };
  }

  /**
   * Add a class and props to the root element if the document is empty.
   */
  public ssrTransformer(element: JSX.Element, { getState }: ExtensionManagerParams) {
    const state = getState();
    const { emptyNodeClass, placeholder } = this.options;
    const { children } = getElementProps(element);
    if (Children.count(children) > 1 || !isDocNodeEmpty(state.doc)) {
      return element;
    }

    const props = getElementProps(children);
    return cloneElement(
      element,
      {},
      cloneElement(children, {
        ...props,
        className: props.className ? `${props.className} ${emptyNodeClass}` : emptyNodeClass,
        'data-placeholder': placeholder,
      }),
    );
  }
}
