import { ComponentType } from 'react';

import {
  EditorViewParameter,
  NodeWithAttributesParameter,
  ProsemirrorAttributes,
} from '@remirror/core-types';

import { PortalContainer } from '../portals';

export interface NodeViewComponentProps<
  GOptions extends BaseExtensionOptions = BaseExtensionOptions,
  GAttributes extends ProsemirrorAttributes = ProsemirrorAttributes
> extends EditorViewParameter, SSRComponentProps<GOptions, GAttributes> {
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

export interface ReactNodeViewParameter<
  GOptions extends BaseExtensionOptions = BaseExtensionOptions,
  GAttributes extends ProsemirrorAttributes = ProsemirrorAttributes
>
  extends EditorViewParameter,
    ComponentParameter<GOptions, GAttributes>,
    NodeWithAttributesParameter<GAttributes>,
    BaseExtensionOptionsParameter<GOptions> {
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

export interface CreateNodeViewParameter<
  GOptions extends BaseExtensionOptions = BaseExtensionOptions,
  GAttributes extends ProsemirrorAttributes = ProsemirrorAttributes
>
  extends Pick<ReactNodeViewParameter, 'portalContainer'>,
    ComponentParameter<GOptions, GAttributes>,
    BaseExtensionOptionsParameter<GOptions> {}

export interface ComponentParameter<
  GOptions extends BaseExtensionOptions = BaseExtensionOptions,
  GAttributes extends ProsemirrorAttributes = ProsemirrorAttributes
> {
  /**
   * The component that will be rendered by this node view.
   */
  Component: ComponentType<NodeViewComponentProps<GOptions, GAttributes>>;
}
