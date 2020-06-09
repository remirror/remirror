import { Children, cloneElement } from 'react';

import {
  DefaultPresetOptions,
  isDocNodeEmpty,
  isString,
  OnSetOptionsParameter,
  Preset,
} from '@remirror/core';
import { PlaceholderExtension, PlaceholderOptions } from '@remirror/extension-placeholder';
import { ReactSSRExtension, ReactSSROptions } from '@remirror/extension-react-ssr';
import { getElementProps } from '@remirror/react-utils';

export interface ReactPresetOptions extends ReactSSROptions, PlaceholderOptions {}

export class ReactPreset extends Preset<ReactPresetOptions> {
  static defaultOptions: DefaultPresetOptions<ReactPresetOptions> = {
    ...ReactSSRExtension.defaultOptions,
    ...PlaceholderExtension.defaultOptions,
  };

  get name() {
    return 'react' as const;
  }

  /**
   * No properties are defined so this can be ignored.
   */
  protected onSetOptions(parameter: OnSetOptionsParameter<ReactPresetOptions>) {
    const { changes } = parameter;

    if (changes.placeholder.changed) {
      const placeholderExtension = this.getExtension(PlaceholderExtension);
      placeholderExtension.setOptions({ placeholder: changes.placeholder.value });
    }
  }

  createExtensions() {
    const { transformers, emptyNodeClass, placeholder } = this.options;
    const placeholderExtension = new PlaceholderExtension({ emptyNodeClass, placeholder });
    this.addSSRToPlaceholder(placeholderExtension);

    return [new ReactSSRExtension({ transformers }), placeholderExtension];
  }

  private addSSRToPlaceholder(extension: PlaceholderExtension) {
    /**
     * Add a class and props to the root element if the document is empty.
     */
    extension.createSSRTransformer = () => {
      return (element: JSX.Element) => {
        const state = this.extensionStore.getState();

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
            emptyNodeClass,
            placeholder,
            className: isString(properties.className)
              ? `${properties.className} ${emptyNodeClass}`
              : emptyNodeClass,
            'data-placeholder': placeholder,
          }),
        );
      };
    };
  }
}
