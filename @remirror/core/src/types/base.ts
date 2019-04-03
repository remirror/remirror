import { Interpolation } from '@emotion/core';
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
export type Attrs = Record<string, string | number | undefined>;

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
   */
  extraAttrs?: ExtraAttrs;

  /**
   * Whether to include the extension's styles.
   */
  includeStyles?: boolean;

  /**
   * Whether to include the extension's pasteRules
   */
  includePasteRules?: boolean;

  /**
   * Whether to include the extension's inputRules
   */
  includeInputRules?: boolean;

  /**
   * Whether to include the extension's keys
   */
  includeKeys?: boolean;

  /**
   * Whether to include the extension's plugin
   */
  includePlugin?: boolean;

  /**
   * Whether to include the extension's nodeView
   */
  includeNodeView?: boolean;

  /**
   * Whether to use the attributes provided by this extension
   */
  includeAttributes?: boolean;
}

export interface NodeExtensionOptions<GComponent = any> extends BaseExtensionOptions {
  SSRComponent?: GComponent;
}
export interface MarkExtensionOptions<GComponent = any> extends BaseExtensionOptions {
  SSRComponent?: GComponent;
}
