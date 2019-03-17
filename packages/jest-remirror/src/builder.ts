import { Attrs, EditorSchema, findMatches } from '@remirror/core';
import flatten from 'flatten';
import { Fragment, Mark, Node, Schema, Slice } from 'prosemirror-model';
import { testSchema } from './test-schema';

/**
 * Represents a ProseMirror "position" in a document.
 */
export type RefPosition = number;

/**
 * A useful feature of the builder is being able to declaratively mark positions
 * in content using the curly braces e.g. `{<>}`.
 *
 * These positions are called "refs" (inspired by React), and are tracked on
 * every node in the tree that has a ref on any of its descendants.
 */
export interface Refs {
  [name: string]: RefPosition;
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
export type BuilderContentFn = RefsContentItem | Array<Node | RefsContentItem>;
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

// Helpers
const isEven = (n: number) => n % 2 === 0;

/**
 * Create a text node.
 *
 * Special markers called "refs" can be put in the text. Refs provide a way to
 * declaratively describe a position within some text, and then access the
 * position in the resulting node.
 *
 * @param value
 * @param schema
 */
export function text(value: string, schema: Schema): RefsContentItem {
  let stripped = '';
  let textIndex = 0;
  const refs: Refs = {};

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
 *
 * @param refs
 * @param offset
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

const isRefsTracker = (n: unknown): n is RefsTracker => typeof n === 'object' && n instanceof RefsTracker;
const isRefsNode = (n: unknown): n is RefsNode => !isRefsTracker(n);

/**
 * Given a collection of nodes, sequence them in an array and return the result
 * along with the updated refs.
 */
export function sequence(...content: RefsContentItem[]) {
  let position = 0;
  let refs = {} as Refs;
  const nodes = [] as RefsNode[];

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
  const refsContent = content.map(item => (typeof item === 'string' ? text(item, schema) : item)) as Array<
    RefsContentItem | RefsContentItem[]
  >;
  return sequence(...flatten<RefsContentItem>(refsContent));
}

/**
 * Create a factory for nodes.
 */
export function nodeFactory(name: string, schema: EditorSchema, attrs: Attrs = {}, marks?: Mark[]) {
  const nodeBuilder = schema.nodes[name];
  if (!nodeBuilder) {
    throw new Error(
      `Node: "${name}" doesn't exist in schema. It's usually caused by lacking of the extension that contributes this node. Schema contains following nodes: ${Object.keys(
        schema.nodes,
      ).join(', ')}`,
    );
  }
  return (...content: BuilderContent[]): RefsNode => {
    const { nodes, refs } = coerce(content, schema);
    const node = nodeBuilder.createChecked(attrs, nodes, marks) as RefsNode;
    node.refs = refs;
    return node;
  };
}

/**
 * Create a factory for marks.
 */
export function markFactory(name: string, schema: EditorSchema, attrs: Attrs = {}, allowDupes = false) {
  const markBuilder = schema.marks[name];
  if (!markBuilder) {
    throw new Error(
      `Mark: "${name}" doesn't exist in schema. It's usually caused by lacking of the extension that contributes this mark. Schema contains following marks: ${Object.keys(
        schema.marks,
      ).join(', ')}`,
    );
  }
  return (...content: BuilderContent[]): RefsNode[] => {
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
}

export const fragment = (...content: BuilderContent[]) => flatten<BuilderContent>(content);
export const slice = (...content: BuilderContent[]) =>
  new Slice(Fragment.from(coerce(content, testSchema).nodes), 0, 0);

/**
 * Builds a 'clean' version of the nodes, without Refs or RefTrackers
 */
export const clean = (content: BuilderContentFn) => (schema: Schema) => {
  const node = content;
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
