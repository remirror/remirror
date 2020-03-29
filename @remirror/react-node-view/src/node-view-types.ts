import { ComponentType } from 'react';

import {
  Attributes,
  BaseExtensionConfig,
  BaseExtensionConfigParams,
  EditorViewParams,
  NodeWithAttrsParams,
  SSRComponentProps,
} from '@remirror/core-types';
import { PortalContainer } from '@remirror/react-portals';

export interface NodeViewComponentProps<
  GOptions extends BaseExtensionConfig = BaseExtensionConfig,
  GAttrs extends Attributes = Attributes
> extends EditorViewParams, SSRComponentProps<GOptions, GAttrs> {
  /**
   * Provides the position of the node view in the prosemirror document
   */
  getPosition: GetPosition;

  /**
   * A ref method which should be used by the component to pass the dom
   * reference of the react element back to the node view
   */
  forwardRef: (node: HTMLElement) => void;

  /**
   * This is true when the component is selected.
   */
  selected: boolean;
}

/**
 * Retrieve the position of the current nodeView
 */
export type GetPosition = (() => number) | boolean;

export interface ReactNodeViewParams<
  GOptions extends BaseExtensionConfig = BaseExtensionConfig,
  GAttrs extends Attributes = Attributes
>
  extends EditorViewParams,
    ComponentParams<GOptions, GAttrs>,
    NodeWithAttrsParams<GAttrs>,
    BaseExtensionConfigParams<GOptions> {
  /**
   * Method for retrieving the position of the current nodeView
   */
  getPosition: GetPosition;

  /**
   * A container and event dispatcher which keeps track of all dom elements that
   * hold node views
   */
  portalContainer: PortalContainer;
}

export interface CreateNodeViewParams<
  GOptions extends BaseExtensionConfig = BaseExtensionConfig,
  GAttrs extends Attributes = Attributes
>
  extends Pick<ReactNodeViewParams, 'portalContainer'>,
    ComponentParams<GOptions, GAttrs>,
    BaseExtensionConfigParams<GOptions> {}

export interface ComponentParams<
  GOptions extends BaseExtensionConfig = BaseExtensionConfig,
  GAttrs extends Attributes = Attributes
> {
  /**
   * The component that will be rendered by this node view.
   */
  Component: ComponentType<NodeViewComponentProps<GOptions, GAttrs>>;
}
