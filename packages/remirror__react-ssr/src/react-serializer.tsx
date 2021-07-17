import { createElement, Fragment, ReactNode } from 'react';
import {
  AnyExtension,
  DOMOutputSpec,
  EditorView,
  ErrorConstant,
  Fragment as ProsemirrorFragment,
  invariant,
  isArray,
  isPlainObject,
  isString,
  Mark,
  MarkExtensionSpec,
  NodeExtensionSpec,
  object,
  ProsemirrorNode,
  RemirrorManager,
  Shape,
} from '@remirror/core';
import type { ManagerStoreReactComponent } from '@remirror/extension-react-ssr';

import { gatherDomMethods, mapProps } from './ssr-utils';

type NodeToDOM = NodeExtensionSpec['toDOM'];
type MarkToDOM = MarkExtensionSpec['toDOM'];

/**
 * Serialize the extension provided schema into a JSX element that can be displayed node and non-dom environments.
 */
export class ReactSerializer<Extension extends AnyExtension> {
  /**
   * Receives the return value from toDOM defined in the node schema and transforms it
   * into JSX
   *
   * @param structure - The DOMOutput spec for the current node
   * @param wraps - passed through any elements that this component should be parent of
   */
  static renderSpec(structure: DOMOutputSpec, wraps?: ReactNode): ReactNode {
    if (isString(structure)) {
      return structure;
    }

    const Component = structure[0];
    const props: Shape = object();
    const attributes = structure[1];
    const children: ReactNode[] = [];

    let currentIndex = 1;

    if (isPlainObject(attributes) && !isArray(attributes)) {
      currentIndex = 2;

      for (const name in attributes) {
        if (attributes[name] != null) {
          props[name] = attributes[name];
        }
      }
    }

    for (let ii = currentIndex; ii < structure.length; ii++) {
      const child = structure[ii];

      if (child === 0) {
        invariant(!(ii < structure.length - 1 || ii > currentIndex), {
          message: 'Content hole (0) must be the only child of its parent node',
          code: ErrorConstant.INTERNAL,
        });

        return createElement(Component, mapProps(props), wraps);
      }

      children.push(ReactSerializer.renderSpec(child as DOMOutputSpec, wraps));
    }

    return createElement(Component, mapProps(props), ...children);
  }

  /**
   * Create a serializer from the extension manager
   *
   * @param manager
   */
  static fromManager<Extension extends AnyExtension>(
    manager: RemirrorManager<Extension>,
  ): ReactSerializer<Extension> {
    return new ReactSerializer(
      this.nodesFromManager(manager),
      this.marksFromManager(manager),
      manager,
    );
  }

  /**
   * Pluck nodes from the extension manager
   *
   * @param manager
   */
  private static nodesFromManager<Extension extends AnyExtension>(
    manager: RemirrorManager<Extension>,
  ) {
    const result = gatherDomMethods(manager.nodes);

    if (!result.text) {
      result.text = (node) => (node.text ? node.text : '');
    }

    return result;
  }

  /**
   * Pluck marks from the extension manager
   *
   * @param manager
   */
  private static marksFromManager<Extension extends AnyExtension>(
    manager: RemirrorManager<Extension>,
  ) {
    return gatherDomMethods(manager.marks);
  }

  nodes: Record<string, NodeToDOM>;
  marks: Record<string, MarkToDOM>;

  readonly #components: Record<string, ManagerStoreReactComponent>;
  readonly #view: EditorView;

  constructor(
    nodes: Record<string, NodeToDOM>,
    marks: Record<string, MarkToDOM>,
    manager: RemirrorManager<Extension>,
  ) {
    this.nodes = nodes;
    this.marks = marks;
    this.#components = manager.store.components ?? object();
    this.#view = manager.view;
  }

  /**
   * The main entry method on this class for traversing through a schema tree and creating JSx.
   *
   * ```ts
   * reactSerializer.serializeFragment(fragment)
   * ```
   *
   * @param fragment
   */
  serializeFragment(fragment: ProsemirrorFragment): JSX.Element {
    const children: ReactNode[] = [];

    fragment.forEach((node) => {
      let child: ReactNode;
      child = this.serializeNode(node);
      node.marks.reverse().forEach((mark) => {
        // TODO test behaviour expectations for `spanning` marks. Currently not HANDLED.
        child = this.serializeMark(mark, node.isInline, child);
      });

      children.push(child);
    });

    return createElement(Fragment, {}, ...children);
  }

  /**
   * Transform the passed in node into a JSX Element
   *
   * @param node
   */
  serializeNode(node: ProsemirrorNode): ReactNode {
    const managerStoreComponent = this.#components[node.type.name];
    const toDOM = this.nodes[node.type.name];

    let children: ReactNode;

    if (node.content.childCount > 0) {
      children = this.serializeFragment(node.content);
    }

    if (managerStoreComponent) {
      const { Component, props } = managerStoreComponent;

      return (
        <Component {...props} node={node} view={this.#view}>
          {children}
        </Component>
      );
    }

    return toDOM && ReactSerializer.renderSpec(toDOM(node), children);
  }

  /**
   * Transform the provided mark into a JSX Element that wraps the current node
   *
   * @param mark
   * @param inline
   * @param wrappedElement
   */
  serializeMark(mark: Mark, inline: boolean, wrappedElement: ReactNode): ReactNode {
    const toDOM = this.marks[mark.type.name];

    // TODO add support for mark components if requested by community
    return toDOM && ReactSerializer.renderSpec(toDOM(mark, inline), wrappedElement);
  }
}
