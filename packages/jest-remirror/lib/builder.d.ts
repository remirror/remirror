import { Mark, MarkType, Node, NodeType, Schema, Slice } from 'prosemirror-model';
/**
 * Represents a ProseMirror "position" in a document.
 */
export declare type RefPosition = number;
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
export declare type RefsContentItem = RefsNode | RefsTracker;
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
export declare type BuilderContentFn = (
  schema: Schema,
) => Node | RefsContentItem | Array<Node | RefsContentItem>;
export declare type BuilderContent = string | BuilderContentFn;
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
export declare class RefsTracker {
  public refs: Refs;
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
export declare function text(value: string, schema: Schema): RefsContentItem;
/**
 * Offset ref position values by some amount.
 */
export declare function offsetRefs(refs: Refs, offset: number): Refs;
/**
 * Given a collection of nodes, sequence them in an array and return the result
 * along with the updated refs.
 */
export declare function sequence(
  ...content: RefsContentItem[]
): {
  nodes: RefsNode[];
  refs: Refs;
};
/**
 * Coerce builder content into ref nodes.
 */
export declare function coerce(
  content: BuilderContent[],
  schema: Schema,
): {
  nodes: RefsNode[];
  refs: Refs;
};
/**
 * Create a factory for nodes.
 */
export declare function nodeFactory(
  type: NodeType,
  attrs?: {},
  marks?: Mark[],
): (...content: BuilderContent[]) => (schema: Schema<any, any>) => RefsNode;
/**
 * Create a factory for marks.
 */
export declare function markFactory(
  type: MarkType,
  attrs?: {},
  allowDupes?: boolean,
): (...content: BuilderContent[]) => (schema: Schema<any, any>) => RefsNode[];
export declare const fragment: (...content: BuilderContent[]) => BuilderContent[];
export declare const slice: (...content: BuilderContent[]) => Slice<any>;
/**
 * Builds a 'clean' version of the nodes, without Refs or RefTrackers
 */
export declare const clean: (
  content: BuilderContentFn,
) => (schema: Schema<any, any>) => Node<Schema<any, any>> | Array<Node<any>> | undefined;
// # sourceMappingURL=builder.d.ts.map
