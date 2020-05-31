import { ExtensionPriority } from '@remirror/core-constants';
import { isFunction, object } from '@remirror/core-helpers';
import { NodeViewMethod, Shape } from '@remirror/core-types';

import { CreateLifecycleMethod, PlainExtension } from '../extension';
import { AnyCombinedUnion } from '../preset';

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
  public static readonly defaultPriority = ExtensionPriority.High;

  get name() {
    return 'nodeView' as const;
  }

  /**
   * Ensure that all ssr transformers are run.
   */
  public onCreate: CreateLifecycleMethod = (extensions) => {
    const nodeViewList: Array<Record<string, NodeViewMethod>> = [];
    const nodeViews: Record<string, NodeViewMethod> = object();

    for (const extension of extensions) {
      if (
        // managerSettings excluded this from running
        this.store.managerSettings.exclude?.nodeViews ||
        // Method doesn't exist
        !extension.createNodeViews ||
        // Extension settings exclude it
        extension.options.exclude?.nodeViews
      ) {
        continue;
      }

      const nodeView = extension.createNodeViews();

      // Unshift used to add make sure higher priority extensions can
      // overwrite the lower priority nodeViews.
      nodeViewList.unshift(isFunction(nodeView) ? { [extension.name]: nodeView } : nodeView);
    }

    for (const nodeView of nodeViewList) {
      Object.assign(nodeViews, nodeView);
    }

    this.store.setStoreKey('nodeViews', nodeViews);
  };
}

declare global {
  namespace Remirror {
    interface ManagerStore<Combined extends AnyCombinedUnion> {
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

    interface ExtensionCreatorMethods {
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
