import { ComponentType } from 'react';

import {
  EditorViewParameter,
  NodeWithAttributesParameter,
  ProsemirrorAttributes,
  Shape,
  UnknownShape,
} from '@remirror/core';

import { PortalContainer } from '../portals';

export interface NodeViewComponentProps extends EditorViewParameter, UnknownShape {
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
  Options extends Shape = Shape,
  Attributes extends ProsemirrorAttributes = ProsemirrorAttributes
> extends EditorViewParameter, ComponentParameter, NodeWithAttributesParameter<Attributes> {
  /**
   * Method for retrieving the position of the current nodeView
   */
  getPosition: GetPosition;

  /**
   * A container and event dispatcher which keeps track of all dom elements that
   * hold node views
   */
  portalContainer: PortalContainer;

  options: Options;
}

export interface CreateNodeViewParameter<
  Options extends Shape = Shape,
  Attributes extends ProsemirrorAttributes = ProsemirrorAttributes
> extends Pick<ReactNodeViewParameter<Options, Attributes>, 'portalContainer'>, ComponentParameter {
  options: Options;
}

export interface ComponentParameter {
  /**
   * The component that will be rendered by this node view.
   */
  Component: ComponentType<NodeViewComponentProps>;
}
