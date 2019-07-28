import { Interpolation } from '@emotion/core';
import { ComponentType } from 'react';

/* Utility Types */

/**
 * Alternative to builtin `keyof` operator.
 */
export type Key<GRecord> = keyof GRecord;

/**
 * An alternative to keyof that only extracts the string keys.
 */
export type StringKey<GRecord> = Extract<Key<GRecord>, string>;

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
 * Taken from `simplytyped` Useful when designing many api's that don't care
 * what function they take in, they just need to know what it returns.
 */
export type AnyFunction<GType = any> = (...args: any[]) => GType;

/**
 * Matches any constructor type (but not of abstract classes).
 */
export type AnyConstructor<GType = unknown> = new (...args: any[]) => GType;

/**
 * Abstract classes don't support the builtin `InstanceType` helper. This is an
 * alternative which allows us to pull out the type of the prototype.
 */
export type AbstractInstanceType<GConstructor extends { prototype: any }> = GConstructor['prototype'];

/**
 * A magical utility which maps a union type to an intersection type using TypeScript KungFu
 * Taken from https://stackoverflow.com/a/50375286/2172153
 */
export type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends ((k: infer I) => void)
  ? I
  : never;

/**
 * Makes specified keys of an interface optional while the rest stay the same.
 */
export type MakeOptional<GType extends {}, GKeys extends Key<GType>> = Omit<GType, GKeys> &
  { [P in GKeys]+?: GType[P] };

/**
 * Makes specified keys of an interface nullable while the rest stay the same.
 */
export type MakeNullable<GType extends {}, GKeys extends Key<GType>> = Omit<GType, GKeys> &
  { [P in GKeys]: GType[P] | null };

/**
 * Makes specified keys of an interface Required while the rest remain
 * unchanged.
 */
export type MakeRequired<GType extends {}, GKeys extends Key<GType>> = Omit<GType, GKeys> &
  { [P in GKeys]-?: GType[P] };

/**
 * Makes specified keys of an interface readonly.
 */
export type MakeReadonly<GType extends {}, GKeys extends Key<GType>> = Omit<GType, GKeys> &
  { +readonly [P in GKeys]: GType[P] };

/**
 * All the literal types
 */
export type Literal = string | number | boolean | undefined | null | void | {};

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

export interface ExtraAttrsObject {
  /**
   * The name of the attribute
   */
  name: string;

  /**
   * The default value for the attr, if left undefined then this becomes a
   * required. and must be provided whenever a node or mark of a type that has
   * them is created.
   */
  default?: string | null;

  /**
   * A function used to extract the attribute from the dom.
   */
  getAttrs?: (domNode: Node) => unknown;
}

/**
 * The first value is the name of the attribute the second value is the default
 * and the third is the optional parse name from the dom via
 * `node.getAttribute()`.
 */
export type ExtraAttrsTuple = [string, string, string?];

/**
 * Data representation tuple used for injecting extra attributes into an
 * extension.
 */
export type ExtraAttrs = string | ExtraAttrsTuple | ExtraAttrsObject;

/**
 * Defines the options that every extension can accept at instantiation.
 *
 * @remarks
 * Make sure to extend from this when defining custom options for your
 * extension.
 */
export interface BaseExtensionOptions {
  /**
   * Add extra styles to the extension.
   */
  extraStyles?: Interpolation;

  /**
   * Inject additional attributes into the defined mark / node schema. This can
   * only be used for `NodeExtensions` and `MarkExtensions`.
   *
   * @remarks
   *
   * Sometimes you need to add additional attributes to a node or mark. This
   * property enables this without needing to create a new extension.
   *
   * - `extraAttrs: ['title']` Create an attribute with name `title`.When
   *   parsing the dom it will look for the attribute `title`
   * - `extraAttrs: [['custom', 'false', 'data-custom'],'title']` - Creates an
   *   attribute with name `custom` and default value `false`. When parsing the
   *   dom it will look for the attribute `data-custom`
   *
   * @default []
   */
  extraAttrs?: ExtraAttrs[];

  /**
   * A configuration object which allows for excluding certain functionality
   * from an extension.
   */
  exclude?: ExcludeOptions;
}

export interface ExcludeOptions {
  /**
   * Whether to exclude the extension's styles.
   *
   * @default false
   */
  styles?: boolean;

  /**
   * Whether to exclude the extension's pasteRules
   *
   * @default false
   */
  pasteRules?: boolean;

  /**
   * Whether to exclude the extension's inputRules
   *
   * @default false
   */
  inputRules?: boolean;

  /**
   * Whether to exclude the extension's keymaps
   *
   * @default false
   */
  keymaps?: boolean;

  /**
   * Whether to exclude the extension's plugin
   *
   * @default false
   */
  plugin?: boolean;

  /**
   * Whether to exclude the extension's nodeView
   *
   * @default false
   */
  nodeView?: boolean;

  /**
   * Whether to use the attributes provided by this extension
   *
   * @default false
   */
  attributes?: boolean;

  /**
   * Whether to use the SSR component when not in a DOM environment
   *
   * @default false
   */
  ssr?: boolean;
}

export interface SSRComponentParams {
  /**
   * The component to render in SSR. The attrs are passed as props.
   *
   * Each node/mark extension can define it's own particular default component
   */
  SSRComponent?: ComponentType<any>;
}

export interface NodeExtensionOptions extends BaseExtensionOptions, SSRComponentParams {}
export interface MarkExtensionOptions extends BaseExtensionOptions, SSRComponentParams {}

/**
 * The render environment which is either on the server (ssr) or in the dom.
 *
 * This is used to force a certain environment to override checks
 */
export type RenderEnvironment = 'ssr' | 'dom';
