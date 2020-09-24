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
interface Branding<Type> {
  readonly [_brand]: Type;
}

/**
 * Used by `Flavor` to mark a type in a readable way.
 */
export interface Flavoring<Flavor> {
  readonly [_flavor]?: Flavor;
}

/**
 * Remove the flavaring from a type.
 */
export type RemoveFlavoring<Type> = Omit<Type, typeof _flavor>;

/**
 * Create a "flavored" version of a type. TypeScript will disallow mixing
 * flavors, but will allow unflavored values of that type to be passed in where
 * a flavored version is expected. This is a less restrictive form of branding.
 */
export type Flavor<Type, F> = Type & Flavoring<F>;

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
  Extra & {
    /**
     * The class is a preserved attribute name.
     */
    class?: string;
  };

export type NodeAttributes<Extra extends object = object> = ProsemirrorAttributes<
  Partial<Remirror.ExtraNodeAttributes> & Extra
>;
export type MarkAttributes<Extra extends object = object> = ProsemirrorAttributes<
  Partial<Remirror.ExtraMarkAttributes> & Extra
>;

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
export type IfNoRequiredProperties<Type extends object, Then, Else> = GetRequiredKeys<
  Type
> extends NeverBrand
  ? Then
  : Else;

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

declare global {
  namespace Remirror {
    /**
     * Define globally available extra node attributes here.
     */
    interface ExtraNodeAttributes {}

    /**
     * Define globally available extra mark attributes here.
     */
    interface ExtraMarkAttributes {}
  }
}
