import { findMatches } from '@remirror/core';
import { flatten } from 'lodash';
import { Fragment, Mark, MarkType, Node, NodeType, Schema, Slice } from 'prosemirror-model';
import testSchema from './test-schema';

/**
 * Represents a ProseMirror "position" in a document.
 */
// type Position = number;

/**
 * A useful feature of the builder is being able to declaratively mark positions
 * in content using the curly braces e.g. `{<>}`.
 *
 * These positions are called "refs" (inspired by React), and are tracked on
 * every node in the tree that has a ref on any of its descendants.
 */
export interface Refs {
  [name: string]: position;
}

/**
 * Content that contains refs information.
 */
export type RefsContentItem = RefsNode | RefsTracker;

/**
 * Content node or mark builders can consume, e.g.
 *
 *     const builder = nodeFactory('p');
 *     builder('string');
 *     builder(aNode);
 *     builder(aRefsNode);
 *     builder(aRefsTracker);
 *     builder([aNode, aRefsNode, aRefsTracker]);
 */

export type BuilderContentFn = (schema: Schema) => Node | RefsContentItem | Array<Node | RefsContentItem>;
export type BuilderContent = string | BuilderContentFn;

/**
 * ProseMirror doesn't support empty text nodes, which can be quite
 * inconvenient when you want to capture a position ref without introducing
 * text.
 *
 * Take a couple of examples:
 *
 *     p('{<>}')
 *     p('Hello ', '{<>}', 'world!')
 *
 * After the ref syntax is stripped you're left with:
 *
 *     p('')
 *     p('Hello ', '', 'world!')
 *
 * This violates the rule of text nodes being non-empty. This class solves the
 * problem by providing an alternative data structure that *only* stores refs,
 * and can be used in scenarios where an empty text would be forbidden.
 *
 * This is done under the hood when using `text()` factory, and instead of
 * always returning a text node, it'll instead return one of two things:
 *
 * - a text node -- when given a non-empty string
 * - a refs tracker -- when given a string that *only* contains refs.
 */
export class RefsTracker {
  public refs!: Refs;
}

/**
 * A standard ProseMirror Node that also tracks refs.
 */
export interface RefsNode extends Node {
  refs: Refs;
}

/**
 * Create a text node.
 *
 * Special markers called "refs" can be put in the text. Refs provide a way to
 * declaratively describe a position within some text, and then access the
 * position in the resulting node.
 */
export function text(value: string, schema: Schema): RefsContentItem {
  let stripped = '';
  let textIndex = 0;
  const refs: Refs = {};

  // Helpers
  const isEven = (n: number) => n % 2 === 0;

  for (const match of findMatches(value, /([\\]+)?{(\w+|<|>|<>|<cell|cell>)}/g)) {
    const [refToken, skipChars, refName] = match;
    let { index } = match;

    const skipLen = skipChars && skipChars.length;
    if (skipLen) {
      if (isEven(skipLen)) {
        index += skipLen / 2;
      } else {
        stripped += value.slice(textIndex, index + (skipLen - 1) / 2);
        stripped += value.slice(index + skipLen, index + refToken.length);
        textIndex = index + refToken.length;
        continue;
      }
    }

    stripped += value.slice(textIndex, index);
    refs[refName] = stripped.length;
    textIndex = match.index + refToken.length;
  }

  stripped += value.slice(textIndex);

  const node = stripped === '' ? new RefsTracker() : (schema.text(stripped) as RefsNode);

  node.refs = refs;
  return node;
}

/**
 * Offset ref position values by some amount.
 */
export function offsetRefs(refs: Refs, offset: number): Refs {
  const result = {} as Refs;
  for (const name in refs) {
    if (refs.hasOwnProperty(name)) {
      result[name] = refs[name] + offset;
    }
  }
  return result;
}

/**
 * Given a collection of nodes, sequence them in an array and return the result
 * along with the updated refs.
 */
export function sequence(...content: RefsContentItem[]) {
  let position = 0;
  let refs = {} as Refs;
  const nodes = [] as RefsNode[];

  // It's bizarre that this is necessary. An if/else in the for...of should have
  // sufficient but it did not work at the time of writing.
  const isRefsTracker = (n: any): n is RefsTracker => n instanceof RefsTracker;
  const isRefsNode = (n: any): n is RefsNode => !isRefsTracker(n);

  for (const node of content) {
    if (isRefsTracker(node)) {
      refs = { ...refs, ...offsetRefs(node.refs, position) };
    }
    if (isRefsNode(node)) {
      const thickness = node.isText ? 0 : 1;
      refs = { ...refs, ...offsetRefs(node.refs, position + thickness) };
      position += node.nodeSize;
      nodes.push(node as RefsNode);
    }
  }
  return { nodes, refs };
}

/**
 * Coerce builder content into ref nodes.
 */
export function coerce(content: BuilderContent[], schema: Schema) {
  const refsContent = content.map(item =>
    typeof item === 'string' ? text(item, schema) : item(schema),
  ) as Array<RefsContentItem | RefsContentItem[]>;
  return sequence(...flatten<RefsContentItem>(refsContent));
}

/**
 * Create a factory for nodes.
 */
export function nodeFactory(type: NodeType, attrs = {}, marks?: Mark[]) {
  return (...content: BuilderContent[]): ((schema: Schema) => RefsNode) => {
    return schema => {
      const { nodes, refs } = coerce(content, schema);
      const nodeBuilder = schema.nodes[type.name];
      if (!nodeBuilder) {
        throw new Error(
          `Node: "${
            type.name
          }" doesn't exist in schema. It's usually caused by lacking of a plugin that contributes this node. Schema contains following nodes: ${Object.keys(
            schema.nodes,
          ).join(', ')}`,
        );
      }
      const node = nodeBuilder.createChecked(attrs, nodes, marks) as RefsNode;
      node.refs = refs;
      return node;
    };
  };
}

/**
 * Create a factory for marks.
 */
export function markFactory(type: MarkType, attrs = {}, allowDupes = false) {
  return (...content: BuilderContent[]): ((schema: Schema) => RefsNode[]) => {
    return schema => {
      const markBuilder = schema.marks[type.name];
      if (!markBuilder) {
        throw new Error(
          `Mark: "${
            type.name
          }" doesn't exist in schema. It's usually caused by lacking of a plugin that contributes this mark. Schema contains following marks: ${Object.keys(
            schema.marks,
          ).join(', ')}`,
        );
      }
      const mark = markBuilder.create(attrs);
      const { nodes } = coerce(content, schema);
      return nodes.map(node => {
        if (!allowDupes && mark.type.isInSet(node.marks)) {
          return node;
        } else {
          const refNode = node.mark(mark.addToSet(node.marks)) as RefsNode;
          refNode.refs = node.refs;
          return refNode;
        }
      });
    };
  };
}

export const fragment = (...content: BuilderContent[]) => flatten<BuilderContent>(content);
export const slice = (...content: BuilderContent[]) =>
  new Slice(Fragment.from(coerce(content, sampleSchema).nodes), 0, 0);

/**
 * Builds a 'clean' version of the nodes, without Refs or RefTrackers
 */
export const clean = (content: BuilderContentFn) => (schema: Schema) => {
  const node = content(schema);
  if (Array.isArray(node)) {
    return node.reduce(
      (acc, next) => {
        if (next instanceof Node) {
          acc.push(Node.fromJSON(schema, next.toJSON()));
        }
        return acc;
      },
      [] as Node[],
    );
  }
  return node instanceof Node ? Node.fromJSON(schema, node.toJSON()) : undefined;
};
