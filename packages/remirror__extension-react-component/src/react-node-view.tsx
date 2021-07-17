import { ComponentType, FunctionComponent, RefCallback } from 'react';
import {
  Decoration,
  EditorView,
  entries,
  ErrorConstant,
  GetFixed,
  invariant,
  isDomNode,
  isElementDomNode,
  isFunction,
  isNodeOfType,
  isPlainObject,
  isString,
  kebabCase,
  NodeView,
  NodeWithAttributes,
  pascalCase,
  ProsemirrorAttributes,
  ProsemirrorNode,
  SELECTED_NODE_CLASS_NAME,
} from '@remirror/core';
import { DOMSerializer } from '@remirror/pm/model';

import type {
  CreateNodeViewProps,
  GetPosition,
  NodeViewComponentProps,
  ReactComponentOptions,
  ReactNodeViewProps,
} from './node-view-types';
import type { PortalContainer } from './portals';

/**
 * This is the node view rapper that makes
 */
export class ReactNodeView implements NodeView {
  /**
   * A shorthand method for creating the `ReactNodeView`.
   */
  static create(
    props: CreateNodeViewProps,
  ): (node: NodeWithAttributes, view: EditorView, getPosition: GetPosition) => NodeView {
    const { portalContainer, ReactComponent, options } = props;

    return (node: NodeWithAttributes, view: EditorView, getPosition: GetPosition) =>
      new ReactNodeView({
        options,
        node,
        view,
        getPosition,
        portalContainer,
        ReactComponent,
      });
  }

  /**
   * The `ProsemirrorNode` that this nodeView is responsible for rendering.
   */
  #node: NodeWithAttributes;

  /**
   * The decorations in the most recent update.
   */
  #decorations: Decoration[] = [];

  /**
   * The editor this nodeView belongs to.
   */
  #view: EditorView;

  /**
   * A container and event dispatcher which keeps track of all dom elements that
   * hold node views
   */
  readonly #portalContainer: PortalContainer;

  /**
   * The extension responsible for creating this NodeView.
   */
  readonly #Component: ComponentType<NodeViewComponentProps>;

  /**
   * Method for retrieving the position of the current nodeView
   */
  readonly #getPosition: () => number;

  /**
   * The options passed through to the `ReactComponent`.
   */
  readonly #options: GetFixed<ReactComponentOptions>;

  #selected = false;

  /**
   * Whether or not the node is currently selected.
   */
  public get selected(): boolean {
    return this.#selected;
  }

  #contentDOM?: Node | undefined;

  /**
   * The wrapper for the content dom. Created from the node spec `toDOM` method.
   */
  #contentDOMWrapper?: HTMLElement | undefined;

  /**
   * The DOM node that should hold the node's content.
   *
   * This is only meaningful if the NodeView is not a leaf type and it can
   * accept content. When these criteria are met, `ProseMirror` will take care of
   * rendering the node's children into it.
   *
   * In order to make use of this in a
   */
  public get contentDOM(): Node | undefined {
    return this.#contentDOM;
  }

  #dom: HTMLElement;

  /**
   * Provides readonly access to the dom element. The dom is automatically for
   * react components.
   */
  get dom(): HTMLElement {
    return this.#dom;
  }

  /**
   * Create the node view for a react component and render it into the dom.
   */
  private constructor({
    getPosition,
    node,
    portalContainer,
    view,
    ReactComponent,
    options,
  }: ReactNodeViewProps) {
    invariant(isFunction(getPosition), {
      message:
        'You are attempting to use a node view for a mark type. Please check your configuration.',
    });

    this.#node = node;
    this.#view = view;
    this.#portalContainer = portalContainer;
    this.#Component = ReactComponent;
    this.#getPosition = getPosition;
    this.#options = options;
    this.#dom = this.createDom();

    const { contentDOM, wrapper } = this.createContentDom() ?? {};

    this.#contentDOM = contentDOM ?? undefined;
    this.#contentDOMWrapper = wrapper;

    if (this.#contentDOMWrapper) {
      this.#dom.append(this.#contentDOMWrapper);
    }

    this.setDomAttributes(this.#node, this.#dom);
    this.Component.displayName = pascalCase(`${this.#node.type.name}NodeView`);

    this.renderComponent();
  }

  /**
   * Render the react component into the dom.
   */
  private renderComponent() {
    this.#portalContainer.render({
      Component: this.Component,
      container: this.#dom,
    });
  }

  /**
   * Create the dom element which will hold the react component.
   */
  private createDom(): HTMLElement {
    const { defaultBlockNode, defaultInlineNode } = this.#options;
    const element: HTMLElement = this.#node.isInline
      ? document.createElement(defaultInlineNode as keyof HTMLElementTagNameMap)
      : document.createElement(defaultBlockNode as keyof HTMLElementTagNameMap);

    // Prosemirror breaks down when it encounters multiple nested empty
    // elements. This class prevents this from happening.
    element.classList.add(`${kebabCase(this.#node.type.name)}-node-view-wrapper`);

    return element;
  }

  /**
   * The element that will contain the content for this element.
   */
  private createContentDom(): { wrapper: HTMLElement; contentDOM?: Node | null } | undefined {
    if (this.#node.isLeaf) {
      return;
    }

    const domSpec = this.#node.type.spec.toDOM?.(this.#node);

    // Only allow content if a domSpec exists which is used to render the content.
    if (!domSpec) {
      return;
    }

    // Let `ProseMirror` interpret the domSpec returned by `toDOM` to provide
    // the dom and `contentDOM`.
    const { contentDOM, dom } = DOMSerializer.renderSpec(document, domSpec);

    // The content dom needs a wrapper node in react since the dom element which
    // it renders inside isn't immediately mounted.
    let wrapper: HTMLElement;

    if (!isElementDomNode(dom)) {
      return;
    }

    // Default to setting the wrapper to a different element.
    wrapper = dom;

    if (dom === contentDOM) {
      wrapper = document.createElement('span');
      wrapper.classList.add(`${kebabCase(this.#node.type.name)}-node-view-content-wrapper`);
      wrapper.append(contentDOM);
    }

    if (isElementDomNode(contentDOM)) {
      // contentDOM.setAttribute('contenteditable', `${this.#view.editable}`);
    }

    return { wrapper, contentDOM };
  }

  /**
   * Adds a ref to the component that has been provided and can be used to set
   * it as the content container. However it is advisable to either not use
   * ReactNodeViews for nodes with content or to take control of rendering the
   * content within the component..
   */
  readonly #forwardRef: RefCallback<HTMLElement> = (node) => {
    if (!node) {
      return;
    }

    invariant(this.#contentDOMWrapper, {
      code: ErrorConstant.REACT_NODE_VIEW,
      message: `You have applied a ref to a node view provided for '${
        this.#node.type.name
      }' which doesn't support content.`,
    });

    node.append(this.#contentDOMWrapper);
  };

  /**
   * Render the provided component.
   *
   * This method is passed into the HTML element.
   */
  private readonly Component: FunctionComponent = () => {
    const ReactComponent = this.#Component;

    invariant(ReactComponent, {
      code: ErrorConstant.REACT_NODE_VIEW,
      message: `The custom react node view provided for ${
        this.#node.type.name
      } doesn't have a valid ReactComponent`,
    });

    return (
      <ReactComponent
        environment='dom'
        updateAttributes={this.updateAttributes}
        selected={this.selected}
        view={this.#view}
        getPosition={this.#getPosition}
        node={this.#node}
        forwardRef={this.#forwardRef}
        decorations={this.#decorations}
      />
    );
  };

  /**
   * Passed to the Component to enable updating the attributes from within the component.
   */
  private readonly updateAttributes = (attrs: ProsemirrorAttributes) => {
    if (!this.#view.editable) {
      return;
    }

    const tr = this.#view.state.tr.setNodeMarkup(this.#getPosition(), undefined, {
      ...this.#node.attrs,
      ...attrs,
    });

    this.#view.dispatch(tr);
  };

  /**
   * This is called whenever the node is called.
   */
  update(node: ProsemirrorNode, decorations: Decoration[]): boolean {
    if (!isNodeOfType({ types: this.#node.type, node })) {
      return false;
    }

    if (this.#node === node && this.#decorations === decorations) {
      return true;
    }

    if (!this.#node.sameMarkup(node)) {
      this.setDomAttributes(node, this.#dom);
    }

    this.#node = node as NodeWithAttributes;
    this.#decorations = decorations;

    this.renderComponent();

    return true;
  }

  /**
   * Copies the attributes from a ProseMirror Node to the parent DOM node.
   *
   * @param node The Prosemirror Node from which to source the attributes
   */
  setDomAttributes(node: ProsemirrorNode, element: HTMLElement): void {
    const { toDOM } = this.#node.type.spec;
    let attributes = node.attrs;

    if (toDOM) {
      const domSpec = toDOM(node);

      if (isString(domSpec) || isDomNodeOutputSpec(domSpec)) {
        return;
      }

      if (isPlainObject(domSpec[1])) {
        attributes = domSpec[1];
      }
    }

    for (const [attribute, value] of entries(attributes)) {
      element.setAttribute(attribute, value);
    }
  }

  /**
   * Marks the node as being selected.
   */
  selectNode(): void {
    this.#selected = true;

    if (this.#dom) {
      this.#dom.classList.add(SELECTED_NODE_CLASS_NAME);
    }

    this.renderComponent();
  }

  /**
   * Remove the selected node markings from this component.
   */
  deselectNode(): void {
    this.#selected = false;

    if (this.#dom) {
      this.#dom.classList.remove(SELECTED_NODE_CLASS_NAME);
    }

    this.renderComponent();
  }

  /**
   * This is called whenever the node is being destroyed.
   */
  destroy(): void {
    this.#portalContainer.remove(this.#dom);
  }

  /**
   * The handler which decides when mutations should be ignored.
   */
  ignoreMutation(mutation: IgnoreMutationProps): boolean {
    if (mutation.type === 'selection') {
      return false;
    }

    if (!this.#contentDOMWrapper) {
      return true;
    }

    return !this.#contentDOMWrapper.contains(mutation.target);
  }
}

type IgnoreMutationProps = MutationRecord | { type: 'selection'; target: Element };

function isDomNodeOutputSpec(value: unknown): value is Node | { dom: Node; contentDOM?: Node } {
  return isDomNode(value) || (isPlainObject(value) && isDomNode(value.dom));
}
