import { ConditionalPick } from 'type-fest';

import { AnyFunction, Flavoring, Shape } from './base-types';

type StaticAnnotation = Flavoring<'StaticAnnotation'>;
type DynamicAnnotation = Flavoring<'DynamicAnnotation'>;
type HandlerAnnotation = Flavoring<'HandlerAnnotation'>;
type ObjectHandlerAnnotation = Flavoring<'ObjectHandlerAnnotation'>;

/**
 * Wrap your type in this to represent a static option, which can only be set at
 * instantiation.
 *
 * ```ts
 * import { Static, PlainExtension } from 'remirror/core';
 *
 * interface MyExtensionOptions {
 *   content: Static<string>;
 * }
 *
 * export class MyExtension extends PlainExtension<MyExtensionOptions> {
 *   get name() {
 *     return 'my' as const';
 *   }
 * }
 *
 * new extension = new MyExtension({ content: 'awesome string' });
 * ```
 *
 * The above example creates an extension with the content options set to
 * 'awesome string'. This value is set and can never be updated.
 */
export type Static<Type> = Type & StaticAnnotation;

/**
 * Wrap an option in this type to indicate to the TypeScript compiler that it is
 * a dynamic property. It can be set through the constructor parameter at
 * instantiation and can by updated throughout the lifetime of your editor.
 *
 * ```ts
 * import { Dynamic, PlainExtension } from 'remirror/core';
 *
 * interface MyExtensionOptions {
 *   isSwitchedOn: Dynamic<boolean>;
 * }
 *
 * export class MyExtension extends PlainExtension<MyExtensionOptions> {
 *   get name() {
 *     return 'my' as const';
 *   }
 * }
 *
 * new extension = new MyExtension({ isSwitchedOn: false });
 * extension.setOptions({ isSwitchedOn: true });
 * ```
 */
export type Dynamic<Type> = Type & DynamicAnnotation;

/**
 * Use this type to annotate a method in your options as an event handler. This
 * will tell the TypeScript compiler to include this event in the relevant code
 * that helps in composing events together.
 */
export type Handler<Type extends AnyFunction> = Type & HandlerAnnotation;

/**
 * Like the handler except it takes an object mapping of names to functions.
 */
export type ObjectHandler<Type extends Record<string, AnyFunction>> = Type &
  ObjectHandlerAnnotation;

/**
 * Get the static `Options` from the options type.
 */
export type GetStatic<Options extends Shape> = ConditionalPick<Options, StaticAnnotation>;

/**
 * Get the dynamic `Options` from the options type.
 */
export type GetDynamic<Options extends Shape> = ConditionalPick<Options, DynamicAnnotation>;

/**
 * Get the event handler `Options` from the options type.
 */
export type GetHandler<Options extends Shape> = ConditionalPick<Options, HandlerAnnotation>;

/**
 * Get the object event handler `Options` from the options type.
 */
export type GetObjectHandler<Options extends Shape> = ConditionalPick<
  Options,
  ObjectHandlerAnnotation
>;

/**
 * This constrains the valid options that can be passed into your extensions or presets.
 */
export interface ValidOptions {
  [option: string]: Remirror.ValidOptionsExtender[keyof Remirror.ValidOptionsExtender];
}

// The following types can be used to wrap your interface / type and produce a
// valid options type.

export type StaticShape<Type extends object> = { [Key in keyof Type]: Static<Type[Key]> };
export type DynamicShape<Type extends object> = { [Key in keyof Type]: Dynamic<Type[Key]> };
export type HandlerShape<Type extends Record<string, AnyFunction>> = {
  [Key in keyof Type]: Handler<Type[Key]>;
};
export type ObjectHandlerShape<Type extends Record<string, Record<string, AnyFunction>>> = {
  [Key in keyof Type]: ObjectHandler<Type[Key]>;
};

declare global {
  namespace Remirror {
    interface ValidOptionsExtender {
      DynamicAnnotation: DynamicAnnotation;
      HandlerAnnotation: HandlerAnnotation;
      ObjectHandlerAnnotation: ObjectHandlerAnnotation;
      StaticAnnotation: StaticAnnotation;
    }
  }
}
