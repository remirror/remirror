import React, { ComponentType } from 'react';

import {
  Decoration,
  EDITOR_CLASS_NAME,
  EditorView,
  isDOMNode,
  isElementDOMNode,
  isFunction,
  isPlainObject,
  isString,
  keys,
  NodeView,
  NodeWithAttributes,
  ProsemirrorAttributes,
  ProsemirrorNode,
  SELECTED_NODE_CLASS_NAME,
  Shape,
} from '@remirror/core';

import { PortalContainer } from '../portals';
import {
  CreateNodeViewParameter,
  GetPosition,
  NodeViewComponentProps,
  ReactNodeViewParameter,
} from './node-view-types';

export class ReactNodeView<
  Options extends Shape,
  Attributes extends ProsemirrorAttributes = ProsemirrorAttributes
> implements NodeView {
  /**
   * A shorthand method for creating the ReactNodeView
   */
  public static createNodeView<
    Options extends Shape,
    Attributes extends ProsemirrorAttributes = ProsemirrorAttributes
  >(parameter: CreateNodeViewParameter<Options, Attributes>) {
    const { Component, portalContainer, options } = parameter;
    return (node: NodeWithAttributes<Attributes>, view: EditorView, getPosition: GetPosition) =>
      new ReactNodeView<Options, Attributes>({
        node,
        view,
        getPosition,
        portalContainer,
        Component,
        options,
      }).init();
  }
  /**
   * The outer element exposed to the editor.
   */
  private domRef?: HTMLElement;
  private contentDOMWrapper: Node | null = null;
  public contentDOM: Node | undefined;

  /**
   * Provides readonly access to the dom element
   */
  get dom() {
    return this.domRef;
  }

  /**
   * The ProsemirrorNode that this nodeView is responsible for rendering.
   */
  public node: NodeWithAttributes<Attributes>;

  /**
   * The editor this nodeView belongs to.
   */
  public view: EditorView;

  // /**
  //  * Only applicable for mark nodeViews. Indicates whether the mark content is inline.
  //  */
  // private markContentInline = false;

  /**
   * A container and event dispatcher which keeps track of all dom elements that
   * hold node views
   */
  private readonly portalContainer: PortalContainer;

  /**
   * The component responsible for rendering the dom via React.
   */
  private readonly Component: ComponentType<NodeViewComponentProps>;

  /**
   * Whether or not the node is currently selected.
   */
  private selected = false;

  /**
   * The options that were passed into the extension that created this nodeView
   */
  private readonly options: Options;

  constructor({
    Component,
    getPosition,
    node,
    portalContainer,
    view,
    options,
  }: ReactNodeViewParameter<Options, Attributes>) {
    this.node = node;
    this.view = view;
    this.portalContainer = portalContainer;
    this.Component = Component;
    this.options = options;

    if (isFunction(getPosition)) {
      this.getPosition = getPosition;
    } else {
      // this._markContentInline = getPosition;
    }
  }

  /**
   * Method for retrieving the position of the current nodeView
   */
  private readonly getPosition = () => 0;

  /**
   * This method exists to move initialization logic out of the constructor,
   * so the object can be initialized properly before calling render first time.
   *
   * Example:
   * Instance properties get added to an object only after super call in
   * constructor, which leads to some methods being undefined during the
   * first render.
   */
  public init() {
    this.domRef = this.createDomRef();
    this.setDomAttributes(this.node, this.domRef);

    const { dom: contentDOMWrapper, contentDOM } = this.getContentDOM() ?? {
      dom: undefined,
      contentDOM: undefined,
    };

    if (contentDOMWrapper) {
      this.domRef.append(contentDOMWrapper);
      this.contentDOM = contentDOM ? contentDOM : contentDOMWrapper;
      this.contentDOMWrapper = contentDOMWrapper;
    }

    this.domRef.classList.add(`${EDITOR_CLASS_NAME}-${this.node.type.name}-node-view`);

    this.renderReactComponent(() => this.render(this.handleRef));
    return this;
  }

  private renderReactComponent(render = () => this.render(this.handleRef)) {
    if (!this.domRef) {
      return;
    }

    this.portalContainer.render({ render, container: this.domRef });
  }

  /**
   * Create a dom ref
   */
  public createDomRef(): HTMLElement {
    const { toDOM } = this.node.type.spec;

    if (toDOM) {
      const domSpec = toDOM(this.node);
      if (isString(domSpec)) {
        return document.createElement(domSpec);
      }

      if (isDOMNode(domSpec)) {
        if (!isElementDOMNode(domSpec)) {
          throw new Error('Invalid HTML Element provided in the DOM Spec');
        }
        return domSpec;
      }

      // Use the outer element string to render the dom node
      return document.createElement(domSpec[0]);
    }
    return this.node.isInline ? document.createElement('span') : document.createElement('div');
  }

  /**
   * Override this method in order to return a content dom which allow
   */
  public getContentDOM(): { dom: Node; contentDOM?: Node | null | undefined } | undefined {
    return;
  }

  private readonly handleRef = (node: HTMLElement | undefined) => {
    const contentDOM = this.contentDOMWrapper ?? this.contentDOM;

    // move the contentDOM node inside the inner reference after rendering
    if (node && contentDOM && !node.contains(contentDOM)) {
      node.append(contentDOM);
    }
  };

  public render(forwardReference: (node: HTMLElement) => void): JSX.Element {
    const { Component, getPosition, node, options, view, selected } = this;

    return (
      <Component
        selected={selected}
        view={view}
        getPosition={getPosition}
        node={node}
        forwardRef={forwardReference}
        config={options}
      />
    );
  }

  public update(
    node: ProsemirrorNode,
    _: Decoration[],
    validUpdate: (currentNode: ProsemirrorNode, newNode: ProsemirrorNode) => boolean = () => true,
  ) {
    // see https://github.com/ProseMirror/prosemirror/issues/648
    const isValidUpdate = this.node.type === node.type && validUpdate(this.node, node);

    if (!isValidUpdate) {
      return false;
    }

    if (this.domRef && !this.node.sameMarkup(node)) {
      this.setDomAttributes(node, this.domRef);
    }

    this.node = node as NodeWithAttributes<Attributes>;
    this.renderReactComponent(() => this.render(this.handleRef));

    return true;
  }

  /**
   * Copies the attributes from a ProseMirror Node to a DOM node.
   *
   * @param node The Prosemirror Node from which to source the attributes
   */
  public setDomAttributes(node: ProsemirrorNode, element: HTMLElement) {
    const { toDOM } = this.node.type.spec;
    if (toDOM) {
      const domSpec = toDOM(node);

      if (isString(domSpec) || isDOMNode(domSpec)) {
        return;
      }

      const attributes = domSpec[1];

      if (isPlainObject(attributes)) {
        keys(attributes).forEach((attribute) => {
          element.setAttribute(attribute, String(attributes[attribute]));
        });

        return;
      }
    }

    keys(node.attrs).forEach((attribute) => {
      element.setAttribute(attribute, node.attrs[attribute]);
    });
  }

  /**
   * Marks the node as being selected
   */
  public selectNode() {
    this.selected = true;

    if (this.domRef) {
      this.domRef.classList.add(SELECTED_NODE_CLASS_NAME);
    }

    this.renderReactComponent();
  }

  // Remove selected node marking from this node.
  public deselectNode() {
    this.selected = false;

    if (this.domRef) {
      this.domRef.classList.remove(SELECTED_NODE_CLASS_NAME);
    }

    this.renderReactComponent();
  }

  /**
   * This is called whenever the node is being destroyed.
   */
  public destroy() {
    if (!this.domRef) {
      return;
    }

    this.portalContainer.remove(this.domRef);
    this.domRef = undefined;
    this.contentDOM = undefined;
  }
}
