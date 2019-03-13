import { Node as PMNode, Schema } from 'prosemirror-model';
import { EditorState as PMEditorState, Plugin as PMPlugin } from 'prosemirror-state';

/* Alias types for better readability throughout the codebase. */

export type ProsemirrorNode = PMNode<EditorSchema>;
export type ProsemirrorPlugin<GPluginState = any> = PMPlugin<GPluginState, EditorSchema>;
export type EditorSchema<GNodes extends string = string, GMarks extends string = string> = Schema<
  GNodes,
  GMarks
>;
export type EditorState<GSchema extends EditorSchema = EditorSchema> = PMEditorState<GSchema>;

/**
 * Utility type for matching the name of a node to via a string or function
 */
export type NodeMatch = string | ((name: string) => boolean);

/**
 * Creates a predicate type
 */
export type Predicate<A> = (u: unknown) => u is A;

/**
 * An object with string keys and values of type `any`
 * Taken from `simplytyped`
 */
export type PlainObject = Record<string, any>;

/**
 * Concisely and cleanly define an arbitrary function.
 * Taken from `simplytyped`
 * Useful when designing many api's that don't care what function they take in, they just need to know what it returns.
 */
export type AnyFunction<R = any> = (...args: any[]) => R;

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
