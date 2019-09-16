import { jsx as createElement } from '@emotion/core';
import {
  AnyExtension,
  DOMOutputSpec,
  ExtensionManager,
  Fragment as ProsemirrorFragment,
  isArray,
  isPlainObject,
  isString,
  Mark,
  MarkExtensionSpec,
  NodeExtensionSpec,
  PlainObject,
  ProsemirrorNode,
} from '@remirror/core';
import React, { ComponentType, Fragment, ReactNode } from 'react';
import { mapProps } from './renderer-utils';

type NodeToDOM = NodeExtensionSpec['toDOM'];
type MarkToDOM = MarkExtensionSpec['toDOM'];

/**
 * Serialize the extension provided schema into a JSX element that can be displayed node and non-dom environments.
 */
export class ReactSerializer<GExtension extends AnyExtension = any> {
  public nodes: Record<string, NodeToDOM>;
  public marks: Record<string, MarkToDOM>;
  private components: Record<string, ComponentType<any>>;
  private options: Record<string, PlainObject>;

  constructor(
    nodes: Record<string, NodeToDOM>,
    marks: Record<string, MarkToDOM>,
    manager: ExtensionManager<GExtension>,
  ) {
    this.nodes = nodes;
    this.marks = marks;
    this.components = manager.components;
    this.options = manager.options;
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
  public serializeFragment(fragment: ProsemirrorFragment): JSX.Element {
    const children: ReactNode[] = [];

    fragment.forEach(node => {
      let child: ReactNode;
      child = this.serializeNode(node);
      node.marks.reverse().forEach(mark => {
        if (mark.type.spec.spanning === false) {
          return;
        }
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
  public serializeNode(node: ProsemirrorNode): ReactNode {
    const Component = this.components[node.type.name];
    const options = this.options[node.type.name];
    const toDOM = this.nodes[node.type.name];

    let children: ReactNode;

    if (node.content.childCount > 0) {
      children = this.serializeFragment(node.content);
    }
    return Component ? (
      <Component options={options} node={node}>
        {children}
      </Component>
    ) : (
      toDOM && ReactSerializer.renderSpec(toDOM(node), children)
    );
  }

  /**
   * Transform the provided mark into a JSX Element that wraps the current node
   *
   * @param mark
   * @param inline
   * @param wrappedElement
   */
  public serializeMark(mark: Mark, inline: boolean, wrappedElement: ReactNode): ReactNode {
    const toDOM = this.marks[mark.type.name];
    const Component = this.components[mark.type.name];
    const options = this.options[mark.type.name];

    return Component ? (
      <Component options={options} mark={mark}>
        {wrappedElement}
      </Component>
    ) : (
      toDOM && ReactSerializer.renderSpec(toDOM(mark, inline), wrappedElement)
    );
  }

  /**
   * Receives the return value from toDOM defined in the node schema and transforms it
   * into JSX
   *
   * @param structure - The DOMOutput spec for the current node
   * @param wraps - passed through any elements that this component should be parent of
   */
  public static renderSpec(structure: DOMOutputSpec, wraps?: ReactNode): ReactNode {
    if (isString(structure)) {
      return structure;
    }

    const Component = structure[0];
    const props: PlainObject = {};
    const attrs = structure[1];
    const children: ReactNode[] = [];
    let currentIndex = 1;
    if (isPlainObject(attrs) && !isArray(attrs)) {
      currentIndex = 2;
      for (const name in attrs) {
        if (attrs[name] != null) {
          props[name] = attrs[name];
        }
      }
    }

    for (let ii = currentIndex; ii < structure.length; ii++) {
      const child = structure[ii];
      if (child === 0) {
        if (ii < structure.length - 1 || ii > currentIndex) {
          throw new RangeError('Content hole (0) must be the only child of its parent node');
        }
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
  public static fromExtensionManager<GExtension extends AnyExtension = any>(
    manager: ExtensionManager<GExtension>,
  ) {
    return new ReactSerializer(
      this.nodesFromExtensionManager(manager),
      this.marksFromExtensionManager(manager),
      manager,
    );
  }

  /**
   * Pluck nodes from the extension manager
   *
   * @param manager
   */
  private static nodesFromExtensionManager<GExtension extends AnyExtension = any>(
    manager: ExtensionManager<GExtension>,
  ) {
    const result = gatherToDOM(manager.nodes);
    if (!result.text) {
      result.text = node => node.text!;
    }
    return result;
  }

  /**
   * Pluck marks from the extension manager
   *
   * @param manager
   */
  private static marksFromExtensionManager<GExtension extends AnyExtension = any>(
    manager: ExtensionManager<GExtension>,
  ) {
    return gatherToDOM(manager.marks);
  }
}

/**
 * Gather up all the toDOM methods from the provided spec object
 *
 * @param specs
 */
function gatherToDOM<GSpec extends MarkExtensionSpec | NodeExtensionSpec>(specs: Record<string, GSpec>) {
  const result: Record<string, GSpec['toDOM']> = {};
  for (const name in specs) {
    if (!specs.hasOwnProperty(name)) {
      continue;
    }
    const toDOM = specs[name].toDOM;
    if (toDOM) {
      result[name] = toDOM;
    }
  }
  return result;
}
