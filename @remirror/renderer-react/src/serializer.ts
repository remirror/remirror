import { Fragment, ReactNode } from 'react';

import { jsx } from '@emotion/core';
import {
  AnyFunction,
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
import { mapProps } from './utils';

type NodeToDOM = NodeExtensionSpec['toDOM'];
type MarkToDOM = MarkExtensionSpec['toDOM'];

/**
 * Serialize the extension provided schema into a JSX element that can be displayed node and non-dom environments.
 */
export class ReactSerializer {
  constructor(public nodes: Record<string, NodeToDOM>, public marks: Record<string, MarkToDOM>) {}

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

    return jsx(Fragment, {}, ...children);
  }

  /**
   * Transform the passed in node into a JSX Element
   *
   * @param node
   */
  public serializeNode(node: ProsemirrorNode): ReactNode {
    const toDOM = this.nodes[node.type.name];
    if (!toDOM) {
      return null;
    }

    let children: ReactNode;

    if (node.content.childCount > 0) {
      children = this.serializeFragment(node.content);
    }
    return ReactSerializer.renderSpec(toDOM(node), children);
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
    return toDOM && ReactSerializer.renderSpec(toDOM(mark, inline), wrappedElement);
  }

  /**
   * Receives the return value from toDOM defined in the node schema and transforms it
   * into JSX
   *
   * @param structure
   * @param wraps - passed through any elements that this component should be parent of.
   */
  public static renderSpec(structure: DOMOutputSpec, wraps?: ReactNode): ReactNode {
    let fn: AnyFunction<JSX.Element> = jsx;
    if (wraps) {
      fn = (...[type, domSpecProps, ...domSpecChildren]: Parameters<typeof jsx>): ReturnType<typeof jsx> =>
        jsx(type, domSpecProps, wraps, ...domSpecChildren);
    }

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
          throw new RangeError('Content hole must be the only child of its parent node');
        }
        return fn(Component, mapProps(props));
      }
      children.push(ReactSerializer.renderSpec(child as DOMOutputSpec, undefined));
    }

    return fn(Component, mapProps(props), ...children);
  }

  /**
   * Create a serializer from the extension manager
   *
   * @param manager
   */
  public static fromExtensionManager(manager: ExtensionManager) {
    return new ReactSerializer(
      this.nodesFromExtensionManager(manager),
      this.marksFromExtensionManager(manager),
    );
  }

  /**
   * Pluck nodes from the extension manager
   *
   * @param manager
   */
  private static nodesFromExtensionManager(manager: ExtensionManager) {
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
  private static marksFromExtensionManager(manager: ExtensionManager) {
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
