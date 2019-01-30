import React from 'react';

import { Node as ProsemirrorNode } from 'prosemirror-model';
import { Decoration, EditorView, NodeView } from 'prosemirror-view';
import { PlainObject } from 'simplytyped';
import { NodeViewPortalContainer } from './portal';

export type GetPosition = () => number;

export interface NodeViewProps extends PlainObject {
  node: ProsemirrorNode;
  view: EditorView;
  getPosition: GetPosition;
}

export class ReactNodeView implements NodeView {
  public static createNodeView(
    component: React.ComponentType<any>,
    portalProviderContainer: NodeViewPortalContainer,
    props?: PlainObject,
  ) {
    return (node: ProsemirrorNode, view: EditorView, getPosition: GetPosition) =>
      new ReactNodeView(node, view, getPosition, portalProviderContainer, props, component).init();
  }

  private domRef?: HTMLElement;
  private contentDOMWrapper: Node | null = null;
  private Component?: React.ComponentType<any>;
  private portalProviderContainer: NodeViewPortalContainer;
  private hasContext: boolean;

  public reactComponentProps: PlainObject = {};
  public view: EditorView;
  private getPosition: GetPosition;
  public contentDOM: Node | undefined;
  public node: ProsemirrorNode;

  constructor(
    node: ProsemirrorNode,
    view: EditorView,
    getPosition: GetPosition,
    portalProviderContainer: NodeViewPortalContainer,
    reactComponentProps: PlainObject = {},
    Component?: React.ComponentType<any>,
    hasContext: boolean = false,
  ) {
    this.node = node;
    this.view = view;
    this.getPosition = getPosition;
    this.portalProviderContainer = portalProviderContainer;
    this.reactComponentProps = reactComponentProps;
    this.Component = Component;
    this.hasContext = hasContext;
  }

  /**
   * This method exists to move initialization logic out of the constructor,
   * so object can be initialized properly before calling render first time.
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

    /* Fix from atlassian
    something gets messed up during mutation processing inside of a
    nodeView if DOM structure has nested plain "div"s, it doesn't see the
    difference between them and it kills the nodeView */
    this.domRef.className = `${this.node.type.name}View-content-wrap`;

    this.renderReactComponent(() => this.render(this.reactComponentProps, this.handleRef));
    return this;
  }

  private renderReactComponent(component: () => React.ReactElement<any> | null) {
    if (!this.domRef || !component) {
      return;
    }

    this.portalProviderContainer.render(component, this.domRef!, this.hasContext);
  }

  public createDomRef(): HTMLElement {
    return this.node.isInline ? document.createElement('span') : document.createElement('div');
  }

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

  public render(
    props: PlainObject,
    forwardRef?: (node: HTMLElement) => void,
  ): React.ReactElement<any> | null {
    return this.Component ? (
      <this.Component
        view={this.view}
        getPosition={this.getPosition}
        node={this.node}
        forwardRef={forwardRef}
        {...props}
      />
    ) : null;
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

    this.node = node;

    this.renderReactComponent(() => this.render(this.reactComponentProps, this.handleRef));

    return true;
  }

  /**
   * Copies the attributes from a ProseMirror Node to a DOM node.
   * @param node The Prosemirror Node from which to source the attributes
   */
  public setDomAttrs(node: ProsemirrorNode, element: HTMLElement) {
    Object.keys(node.attrs || {}).forEach(attr => {
      element.setAttribute(attr, node.attrs[attr]);
    });
  }

  get dom() {
    return this.domRef;
  }

  public destroy() {
    if (!this.domRef) {
      return;
    }

    this.portalProviderContainer.remove(this.domRef);
    this.domRef = undefined;
    this.contentDOM = undefined;
  }
}
