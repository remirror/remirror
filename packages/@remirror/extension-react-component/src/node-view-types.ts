import { RefCallback } from 'react';

import {
  AnyExtension,
  Decoration,
  EditorViewParameter,
  GetFixed,
  NodeWithAttributesParameter,
  ProsemirrorAttributes,
  Static,
  ValidOptions,
} from '@remirror/core';
import { PortalContainer } from '@remirror/react-utils';

export type ReactComponentEnvironment = 'ssr' | 'dom' | 'both';

export interface ReactComponentOptions {
  /**
   * The default main block node.
   *
   * @defaultValue `div`
   *
   * @staticOption
   */
  defaultBlockNode?: keyof HTMLElementTagNameMap;

  /**
   * The default main inline node (for inline content).
   *
   * @defaultValue `span`
   * @staticOption
   */
  defaultInlineNode?: keyof HTMLElementTagNameMap;

  /**
   * The default content node to use.
   *
   * @defaultValue `span`
   * @staticOption
   */
  defaultContentNode?: keyof HTMLElementTagNameMap;

  /**
   * Whether to render as a nodeView, as an ssr component or in both
   * environments.
   */
  defaultEnvironment?: Static<ReactComponentEnvironment>;
}

export interface NodeViewComponentProps extends EditorViewParameter, NodeWithAttributesParameter {
  /**
   * Provides the position of the node view in the prosemirror document
   */
  getPosition: GetPosition;

  /**
   * A ref method which should be used by the component to pass the dom
   * reference of the react element back to the node view. This is used as the
   * dom the content will be rendered into.
   *
   * You can use it if you want to `ProseMirror` to manage the rendering of
   * inner content. Otherwise you can ignore it.
   */
  forwardRef: RefCallback<HTMLElement>;

  /**
   * This is true when the component is selected.
   */
  selected: boolean;

  /**
   * Update the attributes for the target node.
   */
  updateAttributes: (attrs: ProsemirrorAttributes) => void;

  /**
   * The decorations which are currently applied to the nodeView.
   */
  decorations: Decoration[];

  /**
   * The current extension options
   */
  options: ValidOptions;
}

/**
 * Retrieve the position of the current nodeView
 */
export type GetPosition = (() => number) | boolean;

export interface ReactNodeViewParameter
  extends EditorViewParameter,
    NodeWithAttributesParameter,
    CreateNodeViewParameter {
  /**
   * Method for retrieving the position of the current nodeView
   */
  getPosition: GetPosition;
}

export interface CreateNodeViewParameter {
  /**
   * A container and event dispatcher which keeps track of all dom elements that
   * hold node views
   */
  portalContainer: PortalContainer;

  /**
   * The extension that this component uses.
   */
  extension: AnyExtension;

  /**
   * The options passed through to the react extension component.
   */
  options: GetFixed<ReactComponentOptions>;
}
