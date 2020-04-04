import {
  AnyExtension,
  Extension,
  ExtensionCommandReturn,
  ExtensionFactory,
  ExtensionHelperReturn,
  ManagerParameter,
} from '@remirror/core';

import { DEFAULT_TRANSFORMATIONS, SSRTransformer } from './react-ssr-helpers';

interface ReactSSRExtensionSettings {
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
const ReactSSRExtension = ExtensionFactory.typed<ReactSSRExtensionSettings>().plain({
  name: 'reactSSR',
  defaultSettings: { transformers: DEFAULT_TRANSFORMATIONS },

  /**
   * Transform all the transformers.
   */
  createSSRTransformer: (_, extension) => (element) => {
    return extension.settings.transformers.reduce((transformedElement, transformer) => {
      return transformer(transformedElement);
    }, element);
  },

  /**
   * Ensure that all ssr transformers are run.
   */
  onInitialize: ({ getParameter, setStoreKey }) => {
    const ssrTransformers: SSRTransformer[] = [];

    const ssrTransformer: SSRTransformer = (initialElement) => {
      return ssrTransformers.reduce((accumulatedElement, currentTransformer) => {
        return currentTransformer(accumulatedElement);
      }, initialElement);
    };

    return {
      forEachExtension: (extension) => {
        if (!extension.parameter.createSSRTransformer || extension.settings.exclude.reactSSR) {
          return;
        }

        const parameter = getParameter(extension);
        ssrTransformers.push(extension.parameter.createSSRTransformer(parameter, extension));
      },

      afterExtensionLoop: () => {
        setStoreKey('ssrTransformer', ssrTransformer);
      },
    };
  },
});

declare global {
  namespace Remirror {
    interface ExcludeOptions {
      /**
       * Whether to use the SSR component when not in a DOM environment
       *
       * @defaultValue `false`
       */
      reactSSR?: boolean;
    }

    interface ManagerStore<ExtensionUnion extends AnyExtension> {
      /**
       * The transformer for updating the SSR rendering of the prosemirror state
       * and allowing it to render without defects.
       */
      ssrTransformer: SSRTransformer;
    }

    interface ExtensionCreatorMethods<
      Name extends string,
      Settings extends object,
      Properties extends object,
      Commands extends ExtensionCommandReturn,
      Helpers extends ExtensionHelperReturn,
      ProsemirrorType = never
    > {
      /**
       * A method for transforming the SSR JSX received by the extension. Some
       * extensions add decorations to the ProsemirrorView based on their state.
       * These decorations can touch any node or mark and it would be very
       * difficult to model this without being able to take the completed JSX
       * render and transforming it some way.
       *
       * @remarks
       *
       * An example use case is for placeholders which need to render a
       * `data-placeholder` and `class` attribute so that the placeholder is
       * shown by the styles. This method can be called to check if there is
       * only one child of the parent
       */
      createSSRTransformer?: (
        parameter: ManagerParameter,
        extension: Extension<Name, Settings, Properties, Commands, Helpers, ProsemirrorType>,
      ) => SSRTransformer;
    }
  }
}

export type { ReactSSRExtensionSettings };
export { ReactSSRExtension };
