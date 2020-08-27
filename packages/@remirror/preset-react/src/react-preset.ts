import { cx } from 'linaria';
import { Children, cloneElement } from 'react';

import {
  isDocNodeEmpty,
  isEmptyArray,
  isString,
  OnSetOptionsParameter,
  Preset,
  presetDecorator,
} from '@remirror/core';
import { PlaceholderExtension, PlaceholderOptions } from '@remirror/extension-placeholder';
import {
  ReactComponentExtension,
  ReactComponentOptions,
} from '@remirror/extension-react-component';
import { ReactSsrExtension, ReactSsrOptions } from '@remirror/extension-react-ssr';
import { getElementProps } from '@remirror/react-utils';

export interface ReactPresetOptions
  extends ReactSsrOptions,
    PlaceholderOptions,
    ReactComponentOptions {}

/**
 * This is the `ReactPreset which is required when using the `React` framework
 * with **remirror**.
 */
@presetDecorator<ReactPresetOptions>({
  defaultOptions: {
    ...ReactSsrExtension.defaultOptions,
    ...PlaceholderExtension.defaultOptions,
    ...ReactComponentExtension.defaultOptions,
  },
  staticKeys: ['transformers', 'defaultEnvironment'],
})
export class ReactPreset extends Preset<ReactPresetOptions> {
  get name() {
    return 'react' as const;
  }

  /**
   * No properties are defined so this can be ignored.
   */
  protected onSetOptions(parameter: OnSetOptionsParameter<ReactPresetOptions>): void {
    const { pickChanged } = parameter;

    const placeholderOptions = pickChanged(['emptyNodeClass', 'placeholder']);

    if (!isEmptyArray(placeholderOptions)) {
      this.getExtension(PlaceholderExtension).setOptions(placeholderOptions);
    }
  }

  createExtensions() {
    const {
      transformers,
      emptyNodeClass,
      placeholder,
      defaultBlockNode,
      defaultContentNode,
      defaultEnvironment,
      defaultInlineNode,
      nodeViewComponents,
    } = this.options;
    const placeholderExtension = new PlaceholderExtension({ emptyNodeClass, placeholder });
    this.addSSRToPlaceholder(placeholderExtension);

    const reactComponentExtension = new ReactComponentExtension({
      defaultBlockNode,
      defaultContentNode,
      defaultEnvironment,
      defaultInlineNode,
      nodeViewComponents,
    });

    return [new ReactSsrExtension({ transformers }), placeholderExtension, reactComponentExtension];
  }

  /**
   * This method updates the `PlaceholderExtension` instance to add SSR support.
   *
   * It is called when creating extensions.
   */
  private addSSRToPlaceholder(extension: PlaceholderExtension) {
    /**
     * Add a class and props to the root element if the document is empty.
     */
    extension.createSSRTransformer = () => {
      return (element: JSX.Element, state) => {
        state = state ?? this.extensionStore.getState();

        const { emptyNodeClass, placeholder } = extension.options;
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
    };
  }
}
