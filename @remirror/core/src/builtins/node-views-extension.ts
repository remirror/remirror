import { ExtensionPriority } from '@remirror/core-constants';
import { isFunction, object } from '@remirror/core-helpers';
import { NodeViewMethod, Shape } from '@remirror/core-types';

import { AnyExtension, InitializeLifecycleMethod, PlainExtension } from '../extension';
import { AnyPreset } from '../preset';

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
export class NodeViewsExtension extends PlainExtension {
  public static readonly defaultSettings = {};
  public static readonly defaultProperties = {};

  public readonly name = 'nodeView' as const;
  public readonly defaultPriority = ExtensionPriority.High as const;

  /**
   * Ensure that all ssr transformers are run.
   */
  public onInitialize: InitializeLifecycleMethod = (parameter) => {
    const { setStoreKey, managerSettings } = parameter;

    const nodeViewList: Array<Record<string, NodeViewMethod>> = [];
    const nodeViews: Record<string, NodeViewMethod> = object();

    return {
      forEachExtension: (extension) => {
        if (
          // managerSettings excluded this from running
          managerSettings.exclude?.nodeViews ||
          // Method doesn't exist
          !extension.createNodeViews ||
          // Extension settings exclude it
          extension.settings.exclude.nodeViews
        ) {
          return;
        }

        const nodeView = extension.createNodeViews();

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
  };
}

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

    interface ExtensionCreatorMethods<Settings extends Shape = {}, Properties extends Shape = {}> {
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
      createNodeViews?: () => NodeViewMethod | Record<string, NodeViewMethod>;
    }
  }
}
