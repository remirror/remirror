import type { ComponentType, RefCallback } from 'react';
import type {
  Decoration,
  Dynamic,
  EditorViewProps,
  GetFixed,
  NodeWithAttributesProps,
  ProsemirrorAttributes,
  RenderEnvironment,
  Static,
} from '@remirror/core';

import type { PortalContainer } from './portals';

export type ReactComponentEnvironment = 'ssr' | 'dom' | 'both';

export interface ReactComponentOptions {
  /**
   * The default main block node.
   *
   * @default 'div'
   *
   * @staticOption
   */
  defaultBlockNode?: Static<keyof HTMLElementTagNameMap>;

  /**
   * The default main inline node (for inline content).
   *
   * @default 'span'
   * @staticOption
   */
  defaultInlineNode?: Static<keyof HTMLElementTagNameMap>;

  /**
   * The default content node to use.
   *
   * @default 'span'
   * @staticOption
   */
  defaultContentNode?: Static<keyof HTMLElementTagNameMap>;

  /**
   * Whether to render as a nodeView, as an ssr component or in both
   * environments.
   */
  defaultEnvironment?: Static<ReactComponentEnvironment>;

  /**
   * Override any valid schema node with your own custom components
   *
   * ```ts
   * {
   *   paragraph: ({ forwardRef }) => <p style={{ backgroundColor: 'pink' }} ref={forwardRef} />,
   * }
   * ```
   */
  nodeViewComponents?: Dynamic<Record<string, ComponentType<NodeViewComponentProps>>>;
}

export interface NodeViewComponentProps extends EditorViewProps, NodeWithAttributesProps {
  /**
   * - `ssr` - when this is not being rendered in the dom.
   * - `dom` - when rendering in the browser
   */
  environment: RenderEnvironment;

  /**
   * Provides the position of the node view in the prosemirror document
   */
  getPosition: GetPosition;

  /**
   * A ref callback which should be used by the component to pass the dom
   * reference of the react element back to the node view. This is used as
   * container where the content within which the content will be placed.
   *
   * This **must** be used in your component otherwise the editor has no
   * understanding of where to render the node content and defaults to placing
   * it within the provided element created by the `toDOM` method.
   */
  forwardRef: RefCallback<HTMLElement>;

  /**
   * This is true when the component is selected.
   */
  selected: boolean;

  /**
   * Update the attributes for the target node.
   *
   * This should be called in the `useEffect` hook to prevent excessive renders.
   */
  updateAttributes: (attrs: ProsemirrorAttributes) => void;

  /**
   * The decorations which are currently applied to the ReactNodeView.
   */
  decorations: Decoration[];
}

/**
 * Retrieve the position of the current nodeView
 */
export type GetPosition = (() => number) | boolean;

export interface ReactNodeViewProps
  extends EditorViewProps,
    NodeWithAttributesProps,
    CreateNodeViewProps {
  /**
   * Method for retrieving the position of the current nodeView
   */
  getPosition: GetPosition;
}

export interface CreateNodeViewProps {
  /**
   * A container and event dispatcher which keeps track of all dom elements that
   * hold node views
   */
  portalContainer: PortalContainer;

  /**
   * The react component that will be added to the DOM.
   */
  ReactComponent: ComponentType<NodeViewComponentProps>;

  /**
   * The options passed through to the react extension component.
   */
  options: GetFixed<ReactComponentOptions>;
}
