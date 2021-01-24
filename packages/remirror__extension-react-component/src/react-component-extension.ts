import type { ComponentType } from 'react';
import {
  AnyExtension,
  entries,
  extension,
  isNodeExtension,
  NodeViewMethod,
  object,
  PlainExtension,
} from '@remirror/core';

import type {
  NodeViewComponentProps,
  ReactComponentEnvironment,
  ReactComponentOptions,
} from './node-view-types';
import { PortalContainer } from './portals';
import { ReactNodeView } from './react-node-view';

/**
 * The extension transforms the `ReactComponent` property on extensions into the
 * following:
 *
 * - a valid `NodeView` wrapped dom element
 * - a valid `SSR` component.
 *
 * Currently this only support nodes. Support will be added for marks later.
 *
 * @remarks
 *
 * When creating a NodeView using the component property the `toDOM` method
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
 * It's not possible to create a node view without nested dom element in `react`
 * due to this issue https://github.com/facebook/react/issues/12227. It's
 * unlikely that this limitation will be changed any time soon
 * https://github.com/ProseMirror/prosemirror/issues/803
 *
 * NodeViews have a `dom` node which is used as the main wrapper element. For
 * paragraphs this would be the `p` tag and for text this is a `TEXT` node.
 * NodeView's  also have a `contentDOM` property which is where any content from
 * ProseMirror is injected.
 *
 * The difficulty in integration is that the dom node and the content dom node
 * of the `NodeView` are consumed synchronously by ProseMirror. However, react
 * requires a ref to capture the dom node which corresponds to the mounted
 * component. This is done asynchronously. As a result it's not possible to
 * provide the `dom` node or `contentDOM` to ProseMirror while using react.
 *
 * The only way around this is to create both the top level `dom` element and
 * the `contentDOM` element manually in the NodeView and provide a `forwardRef`
 * prop to the component. This prop must be attached to the part of the tree
 * where content should be rendered to. Once the React ref is available the
 * `forwardRef` prop appends the `contentDOM` to the element where `forwardRef`
 * was attached.
 */
@extension<ReactComponentOptions>({
  defaultOptions: {
    defaultBlockNode: 'div',
    defaultInlineNode: 'span',
    defaultContentNode: 'span',
    defaultEnvironment: 'both',
    nodeViewComponents: {},
  },
  staticKeys: ['defaultBlockNode', 'defaultInlineNode', 'defaultContentNode', 'defaultEnvironment'],
})
export class ReactComponentExtension extends PlainExtension<ReactComponentOptions> {
  /**
   * The portal container which keeps track of all the React Portals containing
   * custom prosemirror NodeViews.
   */
  private readonly portalContainer: PortalContainer = new PortalContainer();

  get name() {
    return 'reactComponent' as const;
  }

  /**
   * Add the portal container to the manager store. This can be used by the
   * `<Remirror />` component to manage portals for node content.
   */
  onCreate(): void {
    this.store.setStoreKey('portalContainer', this.portalContainer);
  }

  /**
   * Create the node views from the custom components provided.
   */
  createNodeViews(): Record<string, NodeViewMethod> {
    const nodeViews: Record<string, NodeViewMethod> = object();
    const managerComponents = this.store.managerSettings.nodeViewComponents ?? {};

    // Loop through the extension to pick out the ones with custom components.
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
        ReactComponent: extension.ReactComponent,
        portalContainer: this.portalContainer,
      });
    }

    const namedComponents = entries({ ...this.options.nodeViewComponents, ...managerComponents });

    // Add the custom react components from the extension settings and manager setting.
    for (const [name, ReactComponent] of namedComponents) {
      nodeViews[name] = ReactNodeView.create({
        options: this.options,
        ReactComponent,
        portalContainer: this.portalContainer,
      });
    }

    return nodeViews;
  }
}

declare global {
  namespace Remirror {
    interface ManagerStore<Extension extends AnyExtension> {
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
       * @default undefined
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

    interface ManagerSettings {
      /**
       * Override editor nodes with custom components..
       *
       * ```ts
       * {
       *   paragraph: ({ forwardRef }) => <p style={{ backgroundColor: 'pink' }} ref={forwardRef} />,
       * }
       * ```
       */
      nodeViewComponents?: Record<string, ComponentType<NodeViewComponentProps>>;
    }
  }
}

declare global {
  namespace Remirror {
    interface AllExtensions {
      reactComponent: ReactComponentExtension;
    }
  }
}
