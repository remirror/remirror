import { createElement, Fragment, ReactNode } from 'react';

import {
  AnyFunction,
  DOMOutputSpec,
  ExtensionManager,
  Fragment as ProsemirrorFragment,
  Mark,
  MarkExtensionSpec,
  NodeExtensionSpec,
  PlainObject,
  ProsemirrorNode,
} from '@remirror/core';
import is from '@sindresorhus/is';
import { mapProps } from './utils';

type NodeToDOM = NodeExtensionSpec['toDOM'];
type MarkToDOM = MarkExtensionSpec['toDOM'];

/**
 * Serialize the extension provided schema into a JSX element that can be displayed in non browser environments.
 */
export class ReactSerializer {
  constructor(public nodes: Record<string, NodeToDOM>, public marks: Record<string, MarkToDOM>) {}

  public serializeFragment(fragment: ProsemirrorFragment): JSX.Element {
    // if (!fragment) {
    //   return createElement('p');
    // }
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

  public serializeMark(mark: Mark, inline: boolean, wrappedElement: ReactNode): ReactNode {
    const toDOM = this.marks[mark.type.name];
    return toDOM && ReactSerializer.renderSpec(toDOM(mark, inline), wrappedElement);
  }

  public static renderSpec(structure: DOMOutputSpec, wraps?: ReactNode): ReactNode {
    let fn: AnyFunction<JSX.Element> = createElement;
    if (wraps) {
      fn = (
        ...[type, domSpecProps, ...domSpecChildren]: Parameters<typeof createElement>
      ): ReturnType<typeof createElement> => createElement(type, domSpecProps, wraps, ...domSpecChildren);
    }

    if (is.string(structure)) {
      return structure;
    }

    const Component = structure[0];
    const props: PlainObject = {};
    const attrs = structure[1];
    const children: ReactNode[] = [];
    let currentIndex = 1;
    if (is.plainObject(attrs) && !is.array(attrs)) {
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

  public static fromExtensionManager(manager: ExtensionManager) {
    return new ReactSerializer(
      this.nodesFromExtensionManager(manager),
      this.marksFromExtensionManager(manager),
    );
  }

  private static nodesFromExtensionManager(manager: ExtensionManager) {
    const result = gatherToDOM(manager.nodes);
    if (!result.text) {
      result.text = node => node.text!;
    }
    return result;
  }

  private static marksFromExtensionManager(manager: ExtensionManager) {
    return gatherToDOM(manager.marks);
  }
}

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
