import { MarkType as PMMarkType, Node as PMNode, NodeType as PMNodeType, Schema } from 'prosemirror-model';
import { EditorState as PMEditorState, Plugin as PMPlugin } from 'prosemirror-state';

/* Alias types for better readability throughout the codebase. */

export type ProsemirrorNode = PMNode<EditorSchema>;
export type ProsemirrorPlugin<GPluginState = any> = PMPlugin<GPluginState, EditorSchema>;
export type EditorSchema<GNodes extends string = string, GMarks extends string = string> = Schema<
  GNodes,
  GMarks
>;
export type MarkType = PMMarkType<EditorSchema>;
export type NodeType = PMNodeType<EditorSchema>;
export type EditorState<GSchema extends EditorSchema = EditorSchema> = PMEditorState<GSchema>;

/**
 * A tuple for representing regex's
 * Can be spread as parameters for the `RegExp` constructor
 *
 * ```ts
 * const params: RegExpTuple = ['\\/awesome', 'gi']
 * const regexp = new RegExp(...params);
 * ```
 */
export type RegexTuple = [string, string?];

/**
 * Utility type for matching the name of a node to via a string or function
 */
export type NodeMatch = string | ((name: string, node: ProsemirrorNode) => boolean) | RegexTuple;

/**
 * Creates a predicate type
 */
export type Predicate<A> = (u: unknown) => u is A;

/**
 * An object with string keys and values of type `any`
 * Taken from `simplytyped`
 */
export interface PlainObject {
  [key: string]: unknown;
}

/**
 * Concisely and cleanly define an arbitrary function.
 * Taken from `simplytyped`
 * Useful when designing many api's that don't care what function they take in, they just need to know what it returns.
 */
export type AnyFunction<GType = any> = (...args: any[]) => GType;

/**
 * Matches any constructor type
 */
export type AnyConstructor<GType = any> = new (...args: any[]) => GType;

/**
 * Remove keys from an interface
 */
export type Omit<GType, GKeys extends keyof GType> = Pick<GType, Exclude<keyof GType, GKeys>>;

/**
 * Makes specified keys of an interface optional while the rest stay the same.
 */
export type MakeOptional<GType extends {}, GKeys extends keyof GType> = Omit<GType, GKeys> &
  { [P in GKeys]+?: GType[P] };

/**
 * Makes specified keys of an interface nullable while the rest stay the same.
 */
export type MakeNullable<GType extends {}, GKeys extends keyof GType> = Omit<GType, GKeys> &
  { [P in GKeys]: GType[P] | null };

/**
 * Makes specified keys of an interface Required while the rest remain unchanged.
 */
export type MakeRequired<GType extends {}, GKeys extends keyof GType> = Omit<GType, GKeys> &
  { [P in GKeys]-?: GType[P] };

/**
 * Makes specified keys of an interface readonly.
 */
export type MakeReadonly<GType extends {}, GKeys extends keyof GType> = Omit<GType, GKeys> &
  { +readonly [P in GKeys]: GType[P] };

/**
 * Type literals
 */
export type Literal = string | number | boolean | undefined | null | void | {};

export interface ObjectMark {
  type: string;
  attrs?: Record<string, string | null>;
}

export interface ObjectNode {
  type: string;
  marks?: Array<ObjectMark | string>;
  text?: string;
  content?: ObjectNode[];
  attrs?: Record<string, Literal | object>;
}

/**
 * Content can either be
 * - html string
 * - JSON object matching Prosemirror expected shape
 * - A top level ProsemirrorNode
 */
export type RemirrorContentType = string | ObjectNode | ProsemirrorNode;

export interface Position {
  top: number;
  left: number;
  bottom: number;
  right: number;
}

export type Attrs = Record<string, string | number | undefined>;
