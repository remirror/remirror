import { ComponentType } from 'react';

import {
  Attributes,
  BaseExtensionConfigParameter,
  BaseExtensionSettings,
  EditorViewParameter,
  NodeWithAttributesParameter,
  SSRComponentProps,
} from '@remirror/core-types';
import { PortalContainer } from '@remirror/react-portals';

export interface NodeViewComponentProps<
  GOptions extends BaseExtensionSettings = BaseExtensionSettings,
  GAttrs extends Attributes = Attributes
> extends EditorViewParameter, SSRComponentProps<GOptions, GAttrs> {
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
  GOptions extends BaseExtensionSettings = BaseExtensionSettings,
  GAttrs extends Attributes = Attributes
>
  extends EditorViewParameter,
    ComponentParams<GOptions, GAttrs>,
    NodeWithAttributesParameter<GAttrs>,
    BaseExtensionConfigParameter<GOptions> {
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
  GOptions extends BaseExtensionSettings = BaseExtensionSettings,
  GAttrs extends Attributes = Attributes
>
  extends Pick<ReactNodeViewParams, 'portalContainer'>,
    ComponentParams<GOptions, GAttrs>,
    BaseExtensionConfigParameter<GOptions> {}

export interface ComponentParams<
  GOptions extends BaseExtensionSettings = BaseExtensionSettings,
  GAttrs extends Attributes = Attributes
> {
  /**
   * The component that will be rendered by this node view.
   */
  Component: ComponentType<NodeViewComponentProps<GOptions, GAttrs>>;
}
