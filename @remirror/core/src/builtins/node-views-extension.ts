import { ExtensionPriority } from '@remirror/core-constants';
import { isFunction, object } from '@remirror/core-helpers';
import { And, NodeViewMethod } from '@remirror/core-types';

import { AnyExtension, Extension, ExtensionFactory } from '../extension';
import { AnyPreset } from '../preset';
import { ExtensionCommandReturn, ExtensionHelperReturn, ManagerTypeParameter } from '../types';

/**
 * This extension allows others extension to add the `createNodeView` method
 * for creating nodeViews which alter how the dom is rendered for the node.
 *
 * @remarks
 *
 * This is an example of adding custom functionality to an extension via the
 * `ExtensionParameterMethods`.
 *
 * @builtin
 */
export const NodeViewsExtension = ExtensionFactory.plain({
  name: 'nodeView',
  defaultPriority: ExtensionPriority.High,

  /**
   * Ensure that all ssr transformers are run.
   */
  onInitialize({ getParameter, setStoreKey, managerSettings }) {
    const nodeViewList: Array<Record<string, NodeViewMethod>> = [];
    const nodeViews: Record<string, NodeViewMethod> = object();

    return {
      forEachExtension: (extension) => {
        if (
          // managerSettings excluded this from running
          managerSettings.exclude?.nodeViews ||
          // Method doesn't exist
          !extension.parameter.createNodeViews ||
          // Extension settings exclude it
          extension.settings.exclude.nodeViews
        ) {
          return;
        }

        const parameter = getParameter(extension);
        const nodeView = extension.parameter.createNodeViews(parameter);

        // Unshift used to add make sure higher priority extensions can
        // overwrite the lower priority nodeViews.
        nodeViewList.unshift(isFunction(nodeView) ? { [extension.name]: nodeView } : nodeView);
      },

      afterExtensionLoop: () => {
        for (const nodeView of nodeViewList) {
          Object.assign(nodeViews, nodeView);
        }

        setStoreKey('nodeViews', nodeViews);
      },
    };
  },
});

declare global {
  namespace Remirror {
    interface ManagerStore<ExtensionUnion extends AnyExtension, PresetUnion extends AnyPreset> {
      /**
       * The custom nodeView which can be used to replace the nodes or marks in
       * the dom and change their browser behaviour.
       */
      nodeViews: Record<string, NodeViewMethod>;
    }

    interface ExcludeOptions {
      /**
       * Whether to exclude the extension's nodeView
       *
       * @defaultValue `undefined`
       */
      nodeViews?: boolean;
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
       * Registers one or multiple nodeViews for the extension.
       *
       * This is a shorthand way of registering a nodeView without the need to
       * create a prosemirror plugin. It allows for the registration of one nodeView
       * which has the same name as the extension.
       *
       * To register more than one you would need to use a custom plugin returned
       * from the `plugin` method.
       *
       * @param parameter - schema parameter with type included
       *
       * @alpha
       */
      createNodeViews?: (
        parameter: And<
          ManagerTypeParameter<ProsemirrorType>,
          {
            /**
             * The extension which provides access to the settings and properties.
             */
            extension: Extension<Name, Settings, Properties, Commands, Helpers, ProsemirrorType>;
          }
        >,
      ) => NodeViewMethod | Record<string, NodeViewMethod>;
    }
  }
}
