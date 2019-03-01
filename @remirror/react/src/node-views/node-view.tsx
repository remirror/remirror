import React from 'react';

import { NodeViewPortalContainer } from '@remirror/core';
import { Node as ProsemirrorNode } from 'prosemirror-model';
import { Decoration, EditorView, NodeView } from 'prosemirror-view';
import { PlainObject } from 'simplytyped';

export type GetPosition = () => number;

export interface NodeViewComponentProps<GAttrs = any> {
  node: ProsemirrorNode & { attrs: GAttrs };
  view: EditorView;
  getPosition: GetPosition;
  forwardRef?: (node: HTMLElement) => void | undefined;
}

export class ReactNodeView<GProps extends PlainObject = {}> implements NodeView {
  public static createNodeView<GProps extends PlainObject = {}>(
    Component: React.ComponentType<NodeViewComponentProps & GProps>,
    getPortalContainer: () => NodeViewPortalContainer,
    props: GProps,
  ) {
    return (node: ProsemirrorNode, view: EditorView, getPosition: GetPosition) =>
      new ReactNodeView(node, view, getPosition, getPortalContainer, props, Component).init();
  }

  private domRef?: HTMLElement;
  private contentDOMWrapper: Node | null = null;
  public contentDOM: Node | undefined;

  constructor(
    public node: ProsemirrorNode,
    public view: EditorView,
    private getPosition: GetPosition,
    private getPortalContainer: () => NodeViewPortalContainer,
    public props: GProps = {} as GProps,
    private Component: React.ComponentType<NodeViewComponentProps & GProps>,
    private hasContext: boolean = false,
  ) {}

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

    /* Fix from atlassian
    something gets messed up during mutation processing inside of a
    nodeView if DOM structure has nested plain "div"s, it doesn't see the
    difference between them and it kills the nodeView */
    if (!this.domRef.className) {
      this.domRef.className = `remirror-editor-${this.node.type.name}-node`;
    }

    this.renderReactComponent(() => this.render(this.props, this.handleRef));
    return this;
  }

  private renderReactComponent(component: () => React.ReactElement<any> | null) {
    if (!this.domRef || !component) {
      return;
    }

    this.getPortalContainer().render(component, this.domRef!, this.hasContext);
  }

  public createDomRef(): HTMLElement {
    // let el: HTMLElement;
    // if (this.node.isInline) {
    //   el = document.createElement('span');
    //   el.style.dis
    // }
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

  public render(props: GProps, forwardRef?: (node: HTMLElement) => void): React.ReactElement<any> | null {
    const Component = this.Component;
    return Component ? (
      <Component
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

    this.renderReactComponent(() => this.render(this.props, this.handleRef));

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

    this.getPortalContainer().remove(this.domRef);
    this.domRef = undefined;
    this.contentDOM = undefined;
  }
}
