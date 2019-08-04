import {
  Attrs,
  BaseExtensionOptions,
  Decoration,
  EDITOR_CLASS_NAME,
  EditorView,
  isDOMNode,
  isElementDOMNode,
  isPlainObject,
  isString,
  NodeView,
  NodeWithAttrs,
  PortalContainer,
  ProsemirrorNode,
  SELECTED_NODE_CLASS_NAME,
} from '@remirror/core';
import React, { ComponentType } from 'react';
import {
  CreateNodeViewParams,
  GetPosition,
  NodeViewComponentProps,
  ReactNodeViewParams,
} from './node-view-types';

export class ReactNodeView<
  GOptions extends BaseExtensionOptions = BaseExtensionOptions,
  GAttrs extends Attrs = Attrs
> implements NodeView {
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
  public node: NodeWithAttrs<GAttrs>;

  /**
   * The editor this nodeView belongs to.
   */
  public view: EditorView;

  /**
   * Method for retrieving the position of the current nodeView
   */
  private getPosition: GetPosition;

  /**
   * A container and event dispatcher which keeps track of all dom elements that
   * hold node views
   */
  private portalContainer: PortalContainer;

  /**
   * The component responsible for rendering the dom via React.
   */
  private Component: ComponentType<NodeViewComponentProps<GOptions, GAttrs>>;

  /**
   * Whether or not the node is currently selected.
   */
  private selected = false;

  /**
   * The options that were passed into the extension that created this nodeView
   */
  private options: GOptions;

  constructor({
    Component,
    getPosition,
    node,
    portalContainer,
    view,
    options,
  }: ReactNodeViewParams<GOptions, GAttrs>) {
    this.node = node;
    this.view = view;
    this.getPosition = getPosition;
    this.portalContainer = portalContainer;
    this.Component = Component;
    this.options = options;
  }

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
    this.setDomAttrs(this.node, this.domRef);

    const { dom: contentDOMWrapper, contentDOM } = this.getContentDOM() || {
      dom: undefined,
      contentDOM: undefined,
    };

    if (this.domRef && contentDOMWrapper) {
      this.domRef.appendChild(contentDOMWrapper);
      this.contentDOM = contentDOM ? contentDOM : contentDOMWrapper;
      this.contentDOMWrapper = contentDOMWrapper || contentDOM;
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
    return undefined;
  }

  private handleRef = (node: HTMLElement | undefined) => {
    const contentDOM = this.contentDOMWrapper || this.contentDOM;

    // move the contentDOM node inside the inner reference after rendering
    if (node && contentDOM && !node.contains(contentDOM)) {
      node.appendChild(contentDOM);
    }
  };

  public render(forwardRef: (node: HTMLElement) => void): JSX.Element {
    const { Component, getPosition, node, options, view, selected } = this;

    return (
      <Component
        selected={selected}
        view={view}
        getPosition={getPosition}
        node={node}
        forwardRef={forwardRef}
        options={options}
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
      this.setDomAttrs(node, this.domRef);
    }

    this.node = node as NodeWithAttrs<GAttrs>;
    this.renderReactComponent(() => this.render(this.handleRef));

    return true;
  }

  /**
   * Copies the attributes from a ProseMirror Node to a DOM node.
   *
   * @param node The Prosemirror Node from which to source the attributes
   */
  public setDomAttrs(node: ProsemirrorNode, element: HTMLElement) {
    const { toDOM } = this.node.type.spec;
    if (toDOM) {
      const domSpec = toDOM(node);

      if (isString(domSpec) || isDOMNode(domSpec)) {
        return;
      }

      const attrs = domSpec[1];

      if (isPlainObject(attrs)) {
        Object.keys(attrs).forEach(attr => {
          element.setAttribute(attr, String(attrs[attr]));
        });

        return;
      }
    }

    Object.keys(node.attrs || {}).forEach(attr => {
      element.setAttribute(attr, node.attrs[attr]);
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
    console.log('destroy being called!');
    if (!this.domRef) {
      return;
    }

    this.portalContainer.remove(this.domRef);
    this.domRef = undefined;
    this.contentDOM = undefined;
  }

  /**
   * A shorthand method for creating the ReactNodeView
   */
  public static createNodeView<
    GOptions extends BaseExtensionOptions = BaseExtensionOptions,
    GAttrs extends Attrs = Attrs
  >({ Component, portalContainer, options }: CreateNodeViewParams<GOptions, GAttrs>) {
    return (node: ProsemirrorNode, view: EditorView, getPosition: GetPosition) =>
      new ReactNodeView<GOptions, GAttrs>({
        node: node as NodeWithAttrs<GAttrs>,
        view,
        getPosition,
        portalContainer,
        Component,
        options,
      }).init();
  }
}
