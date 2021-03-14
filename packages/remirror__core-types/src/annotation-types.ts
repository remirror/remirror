import type { ExtensionPriority } from '@remirror/core-constants';
import type {
  AnyFunction,
  ConditionalExcept,
  ConditionalPick,
  Flavoring,
  FlipPartialAndRequired,
  PickPartial,
  RemoveFlavoring,
  Shape,
  StringKey,
} from '@remirror/types';

type StaticAnnotation = Flavoring<'StaticAnnotation'>;
type DynamicAnnotation = Flavoring<'DynamicAnnotation'>;
type HandlerAnnotation = Flavoring<'HandlerAnnotation'>;
type CustomHandlerAnnotation = Flavoring<'CustomHandlerAnnotation'>;

/**
 * This type is in response to the issue raised
 * [here](https://github.com/remirror/remirror/issues/624). It allows an type to
 * be `undefined`.
 */
type AcceptUndefinedAnnotation = Flavoring<'AcceptUndefinedAnnotation'>;

export type RemoveAnnotation<Type> = RemoveFlavoring<
  RemoveFlavoring<
    RemoveFlavoring<
      RemoveFlavoring<RemoveFlavoring<Type, 'StaticAnnotation'>, 'DynamicAnnotation'>,
      'HandlerAnnotation'
    >,
    'CustomHandlerAnnotation'
  >,
  'AcceptUndefinedAnnotation'
>;

export type RemoveAnnotations<Options extends Shape> = {
  [Key in keyof Options]: RemoveAnnotation<Options[Key]>;
};

/**
 * Wrap your type in this to represent a static option, which can only be set at
 * instantiation.
 *
 * ```ts
 * import { Static, PlainExtension } from 'remirror';
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
 *
 * One slight downside to the `Static` annotation is that is does mess up auto
 * suggestions for string literals.
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
 * import { Dynamic, PlainExtension } from 'remirror';
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
 * Wrap a type in this to let the `DefaultOptions` know that it can accept
 * undefined as the default value.
 */
export type AcceptUndefined<Type> = Type & AcceptUndefinedAnnotation;

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
 * with the keys you've annotated as a handler. An **eslint** rule will be
 * created to automate this.
 *
 * ```ts
 * import { PlainExtension, extensionDecorator } from 'remirror';
 * interface CustomOptions {
 *   simple: boolean; // Automatically a dynamic property
 *   onChange: Handler<(value: string) => void>;
 * }
 *
 * @extensionDecorator({ handlerKeys: ['onChange'] }) class CustomExtension
 * extends PlainExtension<CustomOptions> {get name() {return 'custom' as const;
 *   }
 * }
 *
 * // No prompt to include the `onChange` handler due to the annotation. const
 * extension = new CustomExtension({simple: false});
 *
 * const dispose = extension.addHandlers('onChange', (value) => {sideEffect();
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
 * handlers which need to be added to the `keymap` plugin. The custom handler
 * annotation allows you to accept functions or objects which return non void
 * values and set upt the handler for yourself.
 *
 * For custom handlers the `option`s value is meaningless and can only be
 * changed through the `addCustomHandler` method.
 */
export type CustomHandler<Type> = Type & CustomHandlerAnnotation;

/**
 * Get the static `Options` from the options type.
 */
export type GetStatic<Options extends Shape> = ConditionalPick<Options, StaticAnnotation> &
  Partial<ConditionalPick<PickPartial<Options>, StaticAnnotation>>;

/**
 * Get the dynamic `Options` from the options type.
 */
export type GetDynamic<Options extends Shape> = Omit<
  ConditionalExcept<
    Options,
    Exclude<Remirror.ValidOptionsExtender[keyof Remirror.ValidOptionsExtender], DynamicAnnotation>
  >,
  keyof ConditionalPick<
    PickPartial<Options>,
    Exclude<Remirror.ValidOptionsExtender[keyof Remirror.ValidOptionsExtender], DynamicAnnotation>
  >
>;

/**
 * Get the properties that accept undefined as a default.
 */
export type GetAcceptUndefined<Options extends Shape> = ConditionalPick<
  Options,
  AcceptUndefinedAnnotation
> &
  Partial<ConditionalPick<PickPartial<Options>, AcceptUndefinedAnnotation>>;

/**
 * Get the event handler `Options` from the options type.
 */
export type GetHandler<Options extends Shape> = ConditionalPick<Options, HandlerAnnotation> &
  Partial<ConditionalPick<PickPartial<Options>, HandlerAnnotation>>;

/**
 * Get the object event handler `Options` from the options type.
 */
export type GetCustomHandler<Options extends Shape> = ConditionalPick<
  Options,
  CustomHandlerAnnotation
> &
  Partial<ConditionalPick<PickPartial<Options>, CustomHandlerAnnotation>>;

/**
 * Options excluding the handlers.
 */
export type GetStaticAndDynamic<Options extends Shape> = GetDynamic<Options> & GetStatic<Options>;

/**
 * This constrains the valid options that can be passed into your extensions or
 * presets.
 */
export interface ValidOptions {
  [option: string]: any;
}

// The following types can be used to wrap your interface / type and produce a
// valid options type.

export type StaticShape<Type extends object> = { [Key in keyof Type]: Static<Type[Key]> };
export type DynamicShape<Type extends object> = { [Key in keyof Type]: Dynamic<Type[Key]> };
export type HandlerShape<Type extends Shape> = {
  [Key in keyof Type]: Handler<Type[Key]>;
};
export type CustomHandlerShape<Type extends Shape> = {
  [Key in keyof Type]: CustomHandler<Type[Key]>;
};

export type GetFixed<Options extends ValidOptions> = Readonly<Required<Options>>;
export type GetFixedProps<Options extends ValidOptions> = GetFixedDynamic<Options> &
  GetFixedStatic<Options>;
export type GetFlippedStatic<Options extends ValidOptions> = FlipPartialAndRequired<Options>;
export type GetPartialDynamic<Options extends ValidOptions> = Partial<GetDynamic<Options>>;
export type GetFixedStatic<Options extends ValidOptions> = Readonly<Required<GetStatic<Options>>>;
export type GetFixedDynamic<Options extends ValidOptions> = Readonly<Required<GetDynamic<Options>>>;
export type GetFixedCustomHandler<Options extends ValidOptions> = Readonly<
  Required<GetCustomHandler<Options>>
>;

export type GetMappedHandler<Options extends ValidOptions> = {
  [Key in keyof GetHandler<Options>]: Array<
    [priority: ExtensionPriority, handler: GetHandler<Options>[Key]]
  >;
};
export type GetMappedCustomHandler<Options extends ValidOptions> = {
  [Key in keyof GetCustomHandler<Options>]: Array<GetCustomHandler<Options>[Key]>;
};

/**
 * The options that can be passed into a constructor.
 */
export type GetConstructorProps<Options extends ValidOptions> = GetStatic<Options> &
  GetDynamic<Options>;

/**
 * A function used to cleanup any effects from the `Handler` or `Custom`
 * options.
 *
 * In react you would use the return value from the `addHandler` or `setCustom`
 * as the clean up function for your `useEffect` hooks.
 */
export type Dispose = () => void;

export type HandlerKey<Options extends ValidOptions> = StringKey<GetHandler<Options>>;
export type StaticKey<Options extends ValidOptions> = StringKey<GetStatic<Options>>;
export type DynamicKey<Options extends ValidOptions> = StringKey<GetDynamic<Options>>;
export type CustomHandlerKey<Options extends ValidOptions> = StringKey<GetCustomHandler<Options>>;
export type HandlerKeyList<Options extends ValidOptions> = Array<HandlerKey<Options>>;
export type StaticKeyList<Options extends ValidOptions> = Array<StaticKey<Options>>;
export type DynamicKeyList<Options extends ValidOptions> = Array<DynamicKey<Options>>;
export type CustomHandlerKeyList<Options extends ValidOptions> = Array<CustomHandlerKey<Options>>;

declare global {
  namespace Remirror {
    /**
     * The interface which defines the valid annotations that can be used as
     * part of options.
     *
     * @remarks
     * This is used purely for type inference and is not likely to be needed in
     * your codebase.
     */
    interface ValidOptionsExtender {
      DynamicAnnotation: DynamicAnnotation;
      HandlerAnnotation: HandlerAnnotation;
      CustomAnnotation: CustomHandlerAnnotation;
      StaticAnnotation: StaticAnnotation;
    }
  }
}
