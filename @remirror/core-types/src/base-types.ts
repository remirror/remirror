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
export type Predicate<GType> = (u: unknown) => u is GType;

declare const _brand: unique symbol;
declare const _flavor: unique symbol;

/**
 * Used by Flavor to mark a type in a readable way.
 */
interface Flavoring<GFlavor> {
  readonly [_flavor]?: GFlavor;
}

/**
 * Create a "flavored" version of a type. TypeScript will disallow mixing flavors,
 * but will allow unflavored values of that type to be passed in where a flavored
 * version is expected. This is a less restrictive form of branding.
 */
export type Flavor<GType, GFlavor> = GType & Flavoring<GFlavor>;

/**
 * Used by Brand to mark a type in a readable way.
 */
interface Branding<GBrand> {
  readonly [_brand]: GBrand;
}

/**
 * Create a "branded" version of a type. TypeScript won't allow implicit conversion to this type
 */
export type Brand<GType, GBrand> = GType & Branding<GBrand>;

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

/**
 * The render environment which is either on the server (ssr) or in the dom.
 *
 * This is used to force a certain environment to override checks
 */
export type RenderEnvironment = 'ssr' | 'dom';
