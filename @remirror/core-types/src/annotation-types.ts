import { ConditionalExcept, ConditionalPick } from 'type-fest';

import { AnyFunction, Flavoring, FlipPartialAndRequired, Shape } from './base-types';

type StaticAnnotation = Flavoring<'StaticAnnotation'>;
type DynamicAnnotation = Flavoring<'DynamicAnnotation'>;
type HandlerAnnotation = Flavoring<'HandlerAnnotation'>;
type CustomAnnotation = Flavoring<'CustomAnnotation'>;

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
 * @remarks
 *
 * This is the default type assumed and it can be left unused.
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
 * A handler is a callback provided by the user to respond to events from your
 * extension. Often times it's helpful to be able to consume a handler in
 * multiple places. Remirror can help automate the registration of handlers that
 * can be consumed multiple times.
 *
 * @remarks
 *
 * Use this type to annotate a method in your options as an event handler. This
 * will tell the TypeScript compiler to include this event in the relevant
 * methods for composing events together.
 *
 * To automate the creation of handler code you will also need to set the
 * `handlerKeys` static property for your `Extension` or `Preset` to be an array
 * with the keys you've annotated as a handler. An **eslint** rule will be created
 * to automate this.
 *
 * ```ts
 * import { PlainExtension } from 'remirror/core';
 * interface CustomOptions {
 *   simple: boolean; // Automatically a dynamic property
 *   onChange: Handler<(value: string) => void>;
 * }
 *
 * class CustomExtension extends PlainExtension<CustomOptions> {
 *   public static readonly handlerKeys = ['onChange'];
 * }
 *
 * // No prompt to include the `onChange` handler due to the annotation.
 * const extension = new CustomExtension({simple: false});
 *
 * const dispose = extension.addHandlers('onChange', (value) => {
 *   sideEffect();
 * });
 *
 * // Later
 *
 * dispose();
 * ```
 */
export type Handler<Type extends AnyFunction<void>> = Type & HandlerAnnotation;

/**
 * A handler type which gives you full control of what the handler can do and
 * what is can return.
 *
 * For example with keybindings you will probably receive an object of event
 * handlers which need to be added to the `keymap` plugin. The custom handler annotation allows you to accept functions or
 * objects which return non void values and decide how the handler should be used.
 */
export type Custom<Type> = Type & CustomAnnotation;

/**
 * Get the static `Options` from the options type.
 */
export type GetStatic<Options extends Shape> = ConditionalPick<Options, StaticAnnotation>;

/**
 * Get the dynamic `Options` from the options type.
 */
export type GetDynamic<Options extends Shape> = ConditionalExcept<
  Options,
  Exclude<Remirror.ValidOptionsExtender[keyof Remirror.ValidOptionsExtender], DynamicAnnotation>
>;

/**
 * Get the event handler `Options` from the options type.
 */
export type GetHandler<Options extends Shape> = ConditionalPick<Options, HandlerAnnotation>;

/**
 * Get the object event handler `Options` from the options type.
 */
export type GetCustom<Options extends Shape> = ConditionalPick<Options, CustomAnnotation>;

/**
 * This constrains the valid options that can be passed into your extensions or presets.
 */
export interface ValidOptions {
  [option: string]: any;
  // [option: string]: Remirror.ValidOptionsExtender[keyof Remirror.ValidOptionsExtender];
}

// The following types can be used to wrap your interface / type and produce a
// valid options type.

export type StaticShape<Type extends object> = { [Key in keyof Type]: Static<Type[Key]> };
export type DynamicShape<Type extends object> = { [Key in keyof Type]: Dynamic<Type[Key]> };
export type HandlerShape<Type extends Record<string, AnyFunction>> = {
  [Key in keyof Type]: Handler<Type[Key]>;
};
export type CustomShape<Type extends Record<string, Record<string, AnyFunction>>> = {
  [Key in keyof Type]: Custom<Type[Key]>;
};

export type GetFixed<Options extends ValidOptions> = Readonly<Required<Options>>;
export type GetFixedProps<Options extends ValidOptions> = GetFixedDynamic<Options> &
  GetFixedStatic<Options>;
export type GetFlippedStatic<Options extends ValidOptions> = FlipPartialAndRequired<Options>;
export type GetPartialDynamic<Options extends ValidOptions> = Partial<GetDynamic<Options>>;
export type GetFixedStatic<Options extends ValidOptions> = Readonly<Required<GetStatic<Options>>>;
export type GetFixedDynamic<Options extends ValidOptions> = Readonly<Required<GetDynamic<Options>>>;

export type GetMappedHandler<Options extends ValidOptions> = {
  [Key in keyof GetHandler<Options>]: Array<GetHandler<Options>[Key]>;
};
export type GetMappedCustom<Options extends ValidOptions> = {
  [Key in keyof GetCustom<Options>]: Array<GetCustom<Options>[Key]>;
};

/**
 * The options that can be passed into a constructor.
 */
export type GetForConstructor<Options extends ValidOptions> = GetStatic<Options> &
  Partial<GetDynamic<Options>>;

/**
 * A function used to cleanup any effects from the `Handler` or `Custom`
 * options.
 *
 * In react you would use the return value from the `addHandler` or `setCustom`
 * as the clean up function for your `useEffect` hooks.
 */
export type Dispose = () => void;

declare global {
  namespace Remirror {
    /**
     * A fake symbol for storing types on classes and interfaces that can be
     * used for simpler inference.
     *
     * @internal
     */
    const _OPTIONS: unique symbol;

    interface ValidOptionsExtender {
      DynamicAnnotation: DynamicAnnotation;
      HandlerAnnotation: HandlerAnnotation;
      CustomAnnotation: CustomAnnotation;
      StaticAnnotation: StaticAnnotation;
    }
  }
}
