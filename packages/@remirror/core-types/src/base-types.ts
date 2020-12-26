/* Utility Types */

import type { ConditionalExcept, ConditionalPick } from 'type-fest';

import type { Mark, ProsemirrorNode } from '@remirror/pm';

/**
 * An alternative to keyof that only extracts the string keys.
 */
export type StringKey<Type> = Extract<keyof Type, string>;

/**
 * Extract the values of an object as a union type.
 *
 * @remarks
 *
 * ```ts
 * const myRecord = { A: 'a', B: 'b', C: 'c' } as const;
 *
 * type MyRecord = Value<typeof myRecord>; // 'a' | 'b' | 'c'
 * ```
 */
export type Value<Type> = Type[keyof Type];

/**
 * Makes a type nullable or undefined.
 */
export type Nullable<Type> = Type | null | undefined;

/**
 * A shorthand for creating and intersection of two object types.
 */
export type And<Type extends Shape, Other extends Shape> = Type & Other;

/**
 * When the type is never use a default type instead.
 *
 * TODO why doesn't this work
 */
export type UseDefault<Type, Default> = Type extends never ? Default : Type;

/**
 * Extract the values of a tuple as a union type.
 *
 * @remarks
 *
 * ```ts
 * const myTuple = ['a', 'b', 'c'] as const;
 *
 * type MyTuple = TupleValue<typeof myTuple>; // 'a' | 'b' | 'c'
 * ```
 */
export type TupleValue<Tuple extends readonly unknown[]> = Tuple[number];

/**
 * Creates a predicate type.
 */
export type Predicate<Type> = (value: unknown) => value is Type;

declare const _brand: unique symbol;
declare const _flavor: unique symbol;

/**
 * Used by Brand to mark a type in a readable way.
 */
interface Branding<Name> {
  readonly [_brand]: Name;
}

/**
 * Used by `Flavor` to mark a type in a readable way.
 */
export interface Flavoring<Name> {
  readonly [_flavor]?: Name;
}

/**
 * Remove the flavoring from a type.
 */
export type RemoveFlavoring<Type, Name> = Type extends Flavor<infer T, Name> ? T : Type;

/**
 * Create a "flavored" version of a type. TypeScript will disallow mixing
 * flavors, but will allow unflavored values of that type to be passed in where
 * a flavored version is expected. This is a less restrictive form of branding.
 */
export type Flavor<Type, Name> = Type & Flavoring<Name>;

/**
 * Create a "branded" version of a type. TypeScript won't allow implicit
 * conversion to this type
 */
export type Brand<Type, B> = Type & Branding<B>;

/**
 * An object with string keys and values of type `any`
 */
export interface Shape {
  [key: string]: any;
}

/**
 * An object with string keys and values of type `unknown`
 */
export type UnknownShape<Type = unknown> = Record<string, Type>;

/**
 * An alternative to usage of `{}` as a type.
 */
export type EmptyShape = Record<never, never>;

/**
 * Concisely and cleanly define an arbitrary function.
 *
 * @remarks
 * Taken from `simplytyped` Useful when designing many api's that don't care
 * what function they take in, they just need to know what it returns.
 */
export type AnyFunction<Type = any> = (...args: any[]) => Type;

/**
 * Matches any constructor type.
 */
export type AnyConstructor<Type = any> = new (...args: any[]) => Type;

/**
 * Create a type for an array (as a tuple) which has at least the provided
 * `Length`.
 *
 * This can be  useful when `noUncheckedIndexedAccess` is set to true in the
 * compiler options. Annotate types when you are sure the provided index will
 * always be available.
 *
 * ```ts
 * import { MinArray } from '@remirror/core-types';
 *
 * MinArray<string, 2>; // => [string, string, ...string[]];
 * ```
 */
export type MinArray<Type, Length extends number> = Length extends Length
  ? number extends Length
    ? Type[]
    : _MinArray<Type, Length, []>
  : never;
type _MinArray<
  Type,
  Length extends number,
  Accumulated extends unknown[]
> = Accumulated['length'] extends Length
  ? [...Accumulated, ...Type[]]
  : _MinArray<Type, Length, [Type, ...Accumulated]>;

/**
 * An array which must include the first item.
 */
export type Array1<Type> = MinArray<Type, 1>;

/**
 * An array which must include the first 2 items.
 */
export type Array2<Type> = MinArray<Type, 2>;

/**
 * An array which must include the first 3 items.
 */
export type Array3<Type> = MinArray<Type, 3>;

/**
 * Allow a type of a list of types.
 */
export type Listable<Type> = Type | Type[];

/**
 * When a type is really deep and has retained an unnecessary amount of type
 * information, this flattens it to a single array/object/value.
 *
 * TODO not using it right now as it's breaking with globally available types
 * via namespace.
 */
export type Simplify<T> = T extends object | any[] ? { [K in keyof T]: T[K] } : T;

/**
 * Returns tuple types that include every string in union TupleUnion<keyof {
 * bar: string; leet: number }>; ["bar", "leet"] | ["leet", "bar"];
 *
 * Taken from ❤️
 * https://github.com/microsoft/TypeScript/issues/13298#issuecomment-692864087
 *
 */
export type TupleUnion<U extends string, R extends string[] = []> = {
  [S in U]: Exclude<U, S> extends never ? [...R, S] : TupleUnion<Exclude<U, S>, [...R, S]>;
}[U] &
  string[];

/**
 * Extract the valid index union from a provided tuple.
 *
 * ```ts
 * import { IndexUnionFromTuple } from '@remirror/core-types';
 *
 * const tuple = ['a', 'b', 'c'];
 * type Index = IndexUnionFromTuple<typeof tuple> => 0 | 1 | 2
 * ```
 */
export type IndexUnionFromTuple<Tuple extends readonly unknown[]> = Tuple extends Tuple
  ? number extends Tuple['length']
    ? number
    : _IndexUnionFromTuple<[], Tuple['length']>
  : never;
type _IndexUnionFromTuple<
  Tuple extends readonly unknown[],
  Length extends number
> = Tuple['length'] extends Length
  ? Tuple[number]
  : _IndexUnionFromTuple<[...Tuple, Tuple['length']], Length>;

export type TupleRange<Size extends number> = Size extends Size
  ? number extends Size
    ? number[]
    : _NumberRangeTuple<[], Size>
  : never;
type _NumberRangeTuple<
  Tuple extends readonly unknown[],
  Length extends number
> = Tuple['length'] extends Length ? Tuple : _NumberRangeTuple<[...Tuple, Tuple['length']], Length>;

/**
 * Create a tuple of `Size` from the provided `Type`.
 */
export type TupleOf<Type, Size extends number> = Size extends Size
  ? number extends Size
    ? Type[]
    : _TupleOf<Type, Size, []>
  : never;
type _TupleOf<Type, Size extends number, Tuple extends unknown[]> = Tuple['length'] extends Size
  ? Tuple
  : _TupleOf<Type, Size, [Type, ...Tuple]>;

/**
 * Make the whole interface partial except for some specified keys which will be
 * made required.
 */
export type PartialWithRequiredKeys<Type extends object, Keys extends keyof Type> = Partial<
  Pick<Type, Exclude<keyof Type, Keys>>
> &
  Required<Pick<Type, Keys>>;

/**
 * Remove all readonly modifiers from the provided type.
 */
export type Writeable<Type> = { -readonly [Key in keyof Type]: Type[Key] };

/**
 * Makes specified keys of an interface optional while the rest stay the same.
 */
export type MakeOptional<Type extends object, Keys extends keyof Type> = Omit<Type, Keys> &
  { [Key in Keys]+?: Type[Key] };

/**
 * Makes specified keys of an interface optional while the rest stay the same.
 */
export type MakeUndefined<Type extends object, Keys extends keyof Type> = Omit<Type, Keys> &
  { [Key in Keys]: Type[Key] | undefined };

/**
 * Makes specified keys of an interface nullable while the rest stay the same.
 */
export type MakeNullable<Type extends object, Keys extends keyof Type> = Omit<Type, Keys> &
  { [Key in Keys]: Type[Key] | null };

/**
 * Makes specified keys of an interface Required while the rest remain
 * unchanged.
 */
export type MakeRequired<Type extends object, Keys extends keyof Type> = Omit<Type, Keys> &
  { [Key in Keys]-?: Type[Key] };

/**
 * Makes specified keys of an interface readonly.
 */
export type MakeReadonly<Type extends object, Keys extends keyof Type> = Omit<Type, Keys> &
  { +readonly [Key in Keys]: NonNullable<Type[Key]> };

/**
 * All the literal types
 */
export type Literal = string | number | boolean | undefined | null | void | object;

/**
 * A recursive partial type. Useful for object that will be merged with
 * defaults.
 */
export type DeepPartial<Type> = Type extends object
  ? { [K in keyof Type]?: DeepPartial<Type[K]> }
  : Type;

/**
 * Converts every nested type to a string.
 */
export type DeepString<Type> = Type extends object
  ? { [K in keyof Type]: DeepString<Type[K]> }
  : string;

/**
 * A JSON representation of a prosemirror Mark.
 */
export interface ObjectMark {
  type: string;
  attrs?: Record<string, Literal>;
}

/**
 * Defines a position.
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
export type ProsemirrorAttributes<Extra extends object = object> = Record<string, unknown> &
  Remirror.Attributes &
  Extra & {
    /**
     * The class is a preserved attribute name.
     */
    class?: string;
  };

/**
 * A dynamic attributes creator. This is used to create attributes that are
 * dynamically set when a node is first added to the dom.
 */
export type DynamicAttributeCreator = (nodeOrMark: ProsemirrorNode | Mark) => string;

/**
 * The configuration object for adding extra attributes to the node or mark in
 * the editor schema.
 *
 * Please note that using this will alter the schema, so changes here can cause
 * breaking changes for users if not managed carefully.
 *
 * TODO #462 is being added to support migrations so that breaking changes can
 * be handled automatically.
 */
export interface SchemaAttributesObject {
  /**
   * The default value for the attribute being added, if set to `null` then the
   * initial value for any nodes is not required.
   *
   * If set to `undefined` then a value must be provided whenever a node or mark
   * that has this extra attribute is created. ProseMirror will throw if the
   * value isn't required. Make sure you know what you're doing before setting
   * it to undefined as it could cause unintended errors.
   *
   * This can also be a function which enables dynamically setting the attribute
   * based on the value returned.
   */
  default: string | null | DynamicAttributeCreator;

  /**
   * A function used to extract the attribute from the dom and must be applied
   * to the `parseDOM` method.
   *
   * If a string is set this will automatically call
   * `domNode.getAttribute('<name>')`.
   */
  parseDOM?: ((domNode: HTMLElement) => unknown) | string;

  /**
   * Takes the node attributes and applies them to the dom.
   *
   * This is called in the `toDOM` method.
   *
   * - If a string is set this will always be the constant value set in the dom.
   * - If a tuple with two items is set then the first `string` is the attribute
   *   to set in the dom and the second string is the value that will be stored.
   *
   * Return undefined from the function call to skip adding the attribute.
   */
  toDOM?:
    | string
    | [string, string?]
    | ((
        attrs: ProsemirrorAttributes,
        options: NodeMarkOptions,
      ) => string | [string, string?] | null | undefined);
}

export interface NodeMarkOptions {
  node?: ProsemirrorNode;
  mark?: Mark;
}

export interface ApplySchemaAttributes {
  /**
   * A function which returns the object of defaults. Since this is for extra
   * attributes a default must be provided.
   */
  defaults: () => Record<string, { default?: string | null }>;

  /**
   * Read a value from the dome and convert it into prosemirror attributes.
   */
  parse: (domNode: Node | string) => ProsemirrorAttributes;

  /**
   * Take the node attributes and create the object of string attributes for
   * storage on the dom node.
   */
  dom: (nodeOrMark: ProsemirrorNode | Mark) => Record<string, string>;
}

/**
 * A mapping of the attribute name to it's default, getter and setter. If the
 * value is set to a string then it will be resolved as the `default`.
 *
 * If it is set to a function then it will be a dynamic node or mark.
 */
export type SchemaAttributes = Record<
  string,
  SchemaAttributesObject | string | DynamicAttributeCreator
>;

/**
 * A method that can pull all the extraAttributes from the provided dom node.
 */

/**
 * The render environment which is either on the server (ssr) or in the dom.
 *
 * This is used to force a certain environment to override checks
 */
export type RenderEnvironment = 'ssr' | 'dom';

/**
 * Checks the type provided and if it has any properties which are required it
 * will return the `Then` type. When none of the properties are required it will
 * return the `Else` type.
 *
 * @remarks
 *
 * This is a reverse of the `IfNoRequiredProperties` type.
 */
export type IfHasRequiredProperties<Type extends object, Then, Else> = IfNoRequiredProperties<
  Type,
  Else,
  Then
>;

type NeverBrand = Brand<object, never>;

/**
 * A conditional check on the type. When there are no required keys it outputs
 * the `Then` type, otherwise it outputs the `Else` type.
 *
 * @remarks
 *
 * This is useful for dynamically setting the parameter list of a method call
 * depending on whether keys are required.
 */
export type IfNoRequiredProperties<
  Type extends object,
  Then,
  Else
> = GetRequiredKeys<Type> extends NeverBrand ? Then : Else;

/**
 * Get all the keys for required properties on this type.
 */
export type GetRequiredKeys<Type extends object> = keyof ConditionalPick<
  KeepPartialProperties<Type>,
  NeverBrand
>;

/**
 * Keeps the partial properties of a type unchanged. Transforms the rest to
 * `never`.
 */
export type KeepPartialProperties<Type extends object> = {
  [Key in keyof Type]: Type[Key] extends undefined ? Type[Key] : NeverBrand;
};

/**
 * Pick the `partial` properties from the provided Type and make them all
 * required.
 */
export type PickPartial<Type extends object> = {
  [Key in keyof ConditionalExcept<KeepPartialProperties<Type>, NeverBrand>]-?: Type[Key];
};

/**
 * Like pick partial but all types can still specify undefined.
 */
export type UndefinedPickPartial<Type extends object> = {
  [Key in keyof PickPartial<Type>]: PickPartial<Type>[Key] | undefined;
};

/**
 * Only pick the `required` (non-`partial`) types from the given `Type`.
 */
export type PickRequired<Type extends object> = {
  [Key in keyof ConditionalPick<KeepPartialProperties<Type>, NeverBrand>]: Type[Key];
};

/**
 * Reverses the partial and required keys for the type provided. If it was a
 * required property it becomes a partial property and if it was a partial
 * property it becomes a required property.
 */
export type FlipPartialAndRequired<Type extends object> = PickPartial<Type> &
  Partial<PickRequired<Type>>;

/**
 * Reverses the partial and required keys for the type provided. If it was a
 * required property it becomes a partial property and if it was a partial
 * property it becomes a required property.
 */
export type UndefinedFlipPartialAndRequired<Type extends object> = UndefinedPickPartial<Type> &
  Partial<PickRequired<Type>>;

/**
 * Get the diff between two types. All identical keys are stripped away.
 *
 * @remarks
 *
 * ```ts
 * type Fun = Diff<{notFun: false, fun: true}, {notFun: true, wow: string}>;
 * // => { fun: true, wow: string }
 * ```
 */
export type Diff<A, B> = Omit<A, keyof B> & Omit<B, keyof A>;

/**
 * Conditional type which checks if the provided `Type` is and empty object (no properties). If it is
 * uses the `Then` type if not falls back to the `Else` type.
 */
export type IfEmpty<Type extends object, Then, Else> = keyof Type extends never ? Then : Else;

/**
 * Condition that checks if the keys of the two objects match. If so,
 * respond with `Then` otherwise `Else`.
 */
export type IfMatches<A, B, Then, Else> = IfEmpty<Diff<A, B>, Then, Else>;

/**
 * Replace only the current keys with different types.
 */
export type StrictReplace<Type, Replacements extends Record<keyof Type, unknown>> = Omit<
  Type,
  keyof Replacements
> &
  Replacements;

/**
 * Replace and extend any object keys.
 */
export type Replace<Type, Replacements extends Shape> = Omit<Type, keyof Replacements> &
  Replacements;

export type NonNullableShape<Type extends object> = {
  [Key in keyof Type]: NonNullable<Type[Key]>;
};

/**
 * Conditionally pick keys which are functions and have the requested return
 * type.
 */
export type ConditionalReturnKeys<Base, Return> = NonNullable<
  // Wrap in `NonNullable` to strip away the `undefined` type from the produced union.
  {
    // Map through all the keys of the given base type.
    [Key in keyof Base]: Base[Key] extends AnyFunction<infer R> // Pick only keys with types extending the given `Return` type.
      ? // Check whether the inferred `R` type extends the requested `Return` type.
        R extends Return
        ? // The check passes therefor keep the key
          Key
        : // Discard this key since it the return type does not match.
          never
      : // Discard this key since it is not a function.
        never;

    // Convert the produced object into a union type of the keys which passed the conditional test.
  }[keyof Base]
>;

/**
 * Pick the properties from an object that are methods with the requested
 * `Return` type.
 */
export type ConditionalReturnPick<Base, Return> = Pick<Base, ConditionalReturnKeys<Base, Return>>;

type GetRecursivePath<Type, Key extends keyof Type> = Key extends string
  ? Type[Key] extends Record<string, any>
    ?
        | `${Key}.${GetRecursivePath<Type[Key], Exclude<keyof Type[Key], keyof any[]>> & string}`
        | `${Key}.${Exclude<keyof Type[Key], keyof any[]> & string}`
    : never
  : never;
type GetJoinedPath<Type> = GetRecursivePath<Type, keyof Type> | keyof Type;

export type GetPath<Type> = GetJoinedPath<Type> extends string | keyof Type
  ? GetJoinedPath<Type>
  : keyof Type;

export type GetPathValue<
  Type,
  Path extends GetPath<Type>
> = Path extends `${infer Key}.${infer Rest}`
  ? Key extends keyof Type
    ? Rest extends GetPath<Type[Key]>
      ? GetPathValue<Type[Key], Rest>
      : never
    : never
  : Path extends keyof Type
  ? Type[Path]
  : never;

declare global {
  namespace Remirror {
    /**
     * Define globally available extra node attributes here.
     */
    interface Attributes {}
  }
}
