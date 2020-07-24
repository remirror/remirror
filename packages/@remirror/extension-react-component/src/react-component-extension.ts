import { ComponentType } from 'react';

import {
  AnyCombinedUnion,
  CustomHandlerKeyList,
  DefaultExtensionOptions,
  HandlerKeyList,
  isNodeExtension,
  NodeViewMethod,
  object,
  PlainExtension,
  StaticKeyList,
} from '@remirror/core';

import {
  NodeViewComponentProps,
  ReactComponentEnvironment,
  ReactComponentOptions,
} from './node-view-types';
import { PortalContainer } from './portals';
import { ReactNodeView } from './react-node-view';

/**
 * The extension transforms the `Component` property on extensions into a
 *
 * - Valid nodeView wrapped in a wrapper dom element
 * - A valid SSR component.
 *
 * Currently this only support nodes. Support will be added for marks later.
 *
 * @remarks
 *
 * When creating a nodeView using the component property the `toDOM` method
 * returned by the `createNodeSpec` methods needs to be in the following format.
 *
 * - `string` - e.g. `div`. This will be used as the wrapper tag name. .
 * - `[string, 0]` - The wrapper tag name and a `0` indicating that this will be
 *   accepting content.
 * - `[string, object, 0?]` -The wrapper tag name, an object of the attributes
 *   that should be applied to the wrapper tag and a 0 when you want the react
 *   component to have content inserted into it.
 *
 * Unfortunately `React Components` currently require a wrapping tag element
 * when being used in the DOM. See the following for the reasons.
 *
 * ### Caveats
 *
 * It's not possible not to have the nesting in `React` due to this issue
 * https://github.com/facebook/react/issues/12227. Also, it's unlikely that any
 * changes will be made in ProseMirror, which makes a lot of sense
 * https://github.com/ProseMirror/prosemirror/issues/803
 *
 * NodeViews have a `dom` node which is the top element. For paragraphs this
 * would be the `p` tag and for text this is a `TEXT` node. NodeView's  also
 * have a `contentDOM` property which is where any content from ProseMirror is
 * injected.
 *
 * The difficulty in integration is that the dom node and the content dom node
 * of the `NodeView` are consumed synchronously by ProseMirror. However, react
 * requires a ref to determine where the node has been mounted and this is done
 * asynchronously. As a result it's not possible provide the `dom` node or
 * `contentDOM` to ProseMirror while using react.
 *
 * The only way around this, is to create both the top level dom node and the
 * content dom manually in the NodeView and provide a ref to the component which
 * should be attached to the part of the tree where content should be rendered
 * to. Once the React ref is available asynchronously the `contentDOM` can be
 * appended to it.
 *
 * I'm currently improving the API in the next branch and I'll update docs on
 * how it should be used once done.
 */
export class ReactComponentExtension extends PlainExtension<ReactComponentOptions> {
  static readonly staticKeys: StaticKeyList<ReactComponentOptions> = [];
  static readonly handlerKeys: HandlerKeyList<ReactComponentOptions> = [];
  static readonly customHandlerKeys: CustomHandlerKeyList<ReactComponentOptions> = [];

  static readonly defaultOptions: DefaultExtensionOptions<ReactComponentOptions> = {
    defaultBlockNode: 'div',
    defaultInlineNode: 'span',
    defaultContentNode: 'span',
    defaultEnvironment: 'both',
  };

  /**
   * The portal container which keeps track of all the React Portals containing
   * custom prosemirror NodeViews.
   */
  readonly #portalContainer: PortalContainer = new PortalContainer();

  get name() {
    return 'reactNodeView' as const;
  }

  /**
   * Add the portal container to the manager store. This can be used by the
   * `ReactEditor` to manage the portals.
   */
  onCreate = () => {
    this.store.setStoreKey('portalContainer', this.#portalContainer);
  };

  createNodeViews = (): Record<string, NodeViewMethod> => {
    const nodeViews: Record<string, NodeViewMethod> = object();

    for (const extension of this.store.extensions) {
      if (
        !extension.ReactComponent ||
        !isNodeExtension(extension) ||
        extension.reactComponentEnvironment === 'ssr'
      ) {
        continue;
      }

      nodeViews[extension.name] = ReactNodeView.create({
        options: this.options,
        extension,
        portalContainer: this.#portalContainer,
      });
    }

    return nodeViews;
  };
}

declare global {
  namespace Remirror {
    interface ManagerStore<Combined extends AnyCombinedUnion> {
      /**
       * The portal container which keeps track of all the React Portals
       * containing custom ProseMirror node views.
       */
      portalContainer: PortalContainer;
    }

    interface ExcludeOptions {
      /**
       * Whether to exclude the react components.
       *
       * @defaultValue `undefined`
       */
      reactComponents?: boolean;
    }

    interface BaseExtension {
      /**
       * Set the supported environments for this component. By default it is set
       * to use `both`.
       */
      reactComponentEnvironment?: ReactComponentEnvironment;

      /**
       * The component that will be rendered as a node view and dom element. Can
       * also be used to render in SSR.
       *
       * Use this if the automatic componentization in ReactSerializer of the
       * `toDOM` method doesn't produce the expected results in SSR.
       *
       * TODO move this into a separate NodeExtension and MarkExtension based
       * merged interface so that the props can be specified as `{ mark: Mark }`
       * or `{ node: ProsemirrorNode }`.
       */
      ReactComponent?: ComponentType<NodeViewComponentProps>;
    }
  }
}
