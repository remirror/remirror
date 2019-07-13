import { Interpolation } from '@emotion/core';
import { MarkType as PMMarkType, Node as PMNode, NodeType as PMNodeType, Schema } from 'prosemirror-model';
import { EditorState as PMEditorState, Plugin as PMPlugin } from 'prosemirror-state';
import { ComponentType } from 'react';

/* Utility Types */

/**
 * Alternative to builtin `keyof` operator.
 */
export type Key<GRecord> = keyof GRecord;

/**
 * Extract the values of an object as a union type.
 *
 * ```ts
 * const myRecord = { A: 'a', B: 'b', C: 'c' } as const;
 *
 * type MyRecord = Value<typeof myRecord>; // 'a' | 'b' | 'c'
 * ```
 */
export type Value<GRecord> = GRecord[Key<GRecord>];

/**
 * Extract the values of a tuple as a union type.
 *
 * ```ts
 * const myTuple = ['a', 'b', 'c'] as const;
 *
 * type MyTuple = TupleValue<typeof myTuple>; // 'a' | 'b' | 'c'
 * ```
 */
export type TupleValue<GTuple extends readonly unknown[]> = GTuple[number];

/**
 * Creates a predicate type
 */
export type Predicate<A> = (u: unknown) => u is A;

/**
 * An object with string keys and values of type `any`
 *
 * @remarks
 * Taken from `simplytyped`
 */
export interface PlainObject {
  [key: string]: unknown;
}

/**
 * Concisely and cleanly define an arbitrary function.
 *
 * @remarks
 * Taken from `simplytyped`
 * Useful when designing many api's that don't care what function they take in, they just need to know what it returns.
 */
export type AnyFunction<GType = any> = (...args: any[]) => GType;

/**
 * Matches any constructor type
 */
export type AnyConstructor<GType = unknown> = new (...args: any[]) => GType;

/**
 * Abstract classes don't support the builtin `InstanceType` helper. This is an alternative
 * which allows us to pull out the type of the prototype.
 */
export type AbstractInstanceType<GConstructor extends { prototype: any }> = GConstructor['prototype'];

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

/**W
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
 * All the literal types
 */
export type Literal = string | number | boolean | undefined | null | void | {};

/* Alias Types */

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
 * A tuple for use with the regex constructor.
 *
 * @remarks
 *
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
 * A JSON representation of a prosemirror Mark
 */
export interface ObjectMark {
  type: string;
  attrs?: Record<string, string | null>;
}

/**
 * A JSON representation of the prosemirror Node.
 *
 * @remarks
 * This is used to represent the top level doc nodes content.
 */
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
export type RemirrorContentType = string | ObjectNode | ProsemirrorNode | EditorState;

/**
 * Defines a position
 */
export interface Position {
  top: number;
  left: number;
  bottom: number;
  right: number;
}

/**
 * Used for attributes which can be added to prosemirror nodes and marks.
 */
export type Attrs<GExtra extends {} = {}> = Record<string, unknown> & GExtra;

export type AttrsWithClass = Attrs & { class?: string };

/**
 * Data representation tuple used for injecting extra attributes into an extension.
 */
export type ExtraAttrs = Array<string | [string, string]>;

/**
 * Defines the options that every extension can accept at instantiation.
 *
 * @remarks
 * Make sure to extend from this when defining custom options for your extension.
 */
export interface BaseExtensionOptions {
  /**
   * Add extra styles to the extension.
   */
  extraStyles?: Interpolation;

  /**
   * Inject additional attributes into the defined mark / node schema.
   * This can only be used for `NodeExtensions` and `MarkExtensions`.
   *
   * @default []
   */
  extraAttrs?: ExtraAttrs;

  /**
   * Whether to exclude the extension's styles.
   *
   * @default false
   */
  excludeStyles?: boolean;

  /**
   * Whether to exclude the extension's pasteRules
   *
   * @default false
   */
  excludePasteRules?: boolean;

  /**
   * Whether to exclude the extension's inputRules
   *
   * @default false
   */
  excludeInputRules?: boolean;

  /**
   * Whether to exclude the extension's keymaps
   *
   * @default false
   */
  excludeKeymaps?: boolean;

  /**
   * Whether to exclude the extension's plugin
   *
   * @default false
   */
  excludePlugin?: boolean;

  /**
   * Whether to exclude the extension's nodeView
   *
   * @default false
   */
  excludeNodeView?: boolean;

  /**
   * Whether to use the attributes provided by this extension
   *
   * @default false
   */
  excludeAttributes?: boolean;

  /**
   * Whether to use the SSR component when not in a DOM environment
   *
   * @default false
   */
  disableSSR?: boolean;
}

export interface SSRComponentParams {
  /**
   * The component to render in SSR. The attrs are passed as props.
   *
   * Each node/mark extension can define it's own particular default component
   */
  SSRComponent?: ComponentType<Attrs>;
}

export interface NodeExtensionOptions extends BaseExtensionOptions, SSRComponentParams {}
export interface MarkExtensionOptions extends BaseExtensionOptions, SSRComponentParams {}

/**
 * The render environment which is either on the server (ssr) or in the dom.
 *
 * This is used to force a certain environment to override checks
 */
export type RenderEnvironment = 'ssr' | 'dom';
