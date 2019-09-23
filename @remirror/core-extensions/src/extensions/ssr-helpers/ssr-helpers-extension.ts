import { Extension } from '@remirror/core';
import { BaseExtensionOptions, ExtensionManagerParams } from '@remirror/core-types';
import { DEFAULT_TRANSFORMATIONS, SSRTransformer } from './ssr-helpers-utils';

export interface SSRHelperExtensionOptions extends BaseExtensionOptions {
  transformers?: SSRTransformer[];
}

/**
 * This extension makes it easier to add SSR transformations to the editor.
 *
 * @remarks
 *
 * There are subtle things that prosemirror does when it loads the document that can cause things to jump around.
 *
 * The aim of this extension is to provide a series of helper transformations which deal with the typical problems
 * that prosemirror presents when rendering on the server.
 *
 * The transformations can also serve as a guideline when creating your own SSRTransforms. However in most cases the
 * defaults should be sufficient.
 */
export class SSRHelperExtension extends Extension<SSRHelperExtensionOptions> {
  get name() {
    return 'ssrHelper' as const;
  }

  get defaultOptions() {
    return {
      transformers: DEFAULT_TRANSFORMATIONS,
    };
  }

  /**
   * Runs through all the provided transformations for changing the rendered SSR component.
   */
  public ssrTransformer(element: JSX.Element, params: ExtensionManagerParams) {
    return this.options.transformers.reduce((transformedElement, transformer) => {
      return transformer(transformedElement, params);
    }, element);
  }
}
