/* eslint-disable @typescript-eslint/member-ordering */

import {
  __INTERNAL_REMIRROR_IDENTIFIER_KEY__,
  ErrorConstant,
  RemirrorIdentifier,
} from '@remirror/core-constants';
import {
  deepMerge,
  invariant,
  isArray,
  isPlainObject,
  noop,
  object,
  omit,
} from '@remirror/core-helpers';
import {
  AnyFunction,
  Dispose,
  EmptyShape,
  GetConstructorParameter,
  GetCustomHandler,
  GetFixed,
  GetFixedDynamic,
  GetHandler,
  GetMappedHandler,
  GetPartialDynamic,
  GetStatic,
  HandlerKeyList,
  IfNoRequiredProperties,
  Replace,
  Shape,
  UndefinedFlipPartialAndRequired,
  ValidOptions,
} from '@remirror/core-types';

import { getChangedOptions } from '../helpers';
import { OnSetOptionsParameter } from '../types';

interface BaseClassConstructorParameter<DefaultStaticOptions extends Shape = EmptyShape> {
  validator: (Constructor: unknown, code: ErrorConstant) => void;
  code: ErrorConstant;
  defaultOptions: DefaultStaticOptions;
}

export abstract class BaseClass<
  Options extends ValidOptions = EmptyShape,
  DefaultStaticOptions extends Shape = EmptyShape
> {
  /**
   * The default options for this extension.
   */
  static readonly defaultOptions = {};

  /**
   * The static keys for this class.
   */
  static readonly staticKeys: string[] = [];

  /**
   * The event handler keys.
   */
  static readonly handlerKeys: string[] = [];

  /**
   * The custom keys.
   */
  static readonly customHandlerKeys: string[] = [];

  /**
   * Not for usage. This is purely for types to make it easier to infer
   * the type of `Settings` on an extension instance.
   */
  ['~O']: Options & DefaultStaticOptions;

  /**
   * The identifier for the extension which can determine whether it is a node,
   * mark or plain extension.
   * @internal
   */
  abstract readonly [__INTERNAL_REMIRROR_IDENTIFIER_KEY__]: RemirrorIdentifier;

  /**
   * The unique name of this extension.
   *
   * @remarks
   *
   * Every extension **must** have a name. The name should have a distinct type
   * to allow for better type inference for end users. By convention the name
   * should be `camelCased` and unique within your editor instance.
   *
   * ```ts
   * class SimpleExtension extends Extension {
   *   get name() {
   *     return 'simple' as const;
   *   }
   * }
   * ```
   */
  abstract get name(): string;

  /**
   * The options for this extension.
   *
   * @remarks
   *
   * Options are composed of Static, Dynamic, Handlers and ObjectHandlers.
   *
   * - `Static` - set at instantiation by the constructor.
   * - `Dynamic` - optionally set at instantiation by the constructor and also
   *   set during the runtime.
   * - `Handlers` - can only be set during the runtime.
   * - `ObjectHandlers` - Can only be set during the runtime of the extension.
   */
  get options() {
    return this.#options;
  }

  get initialOptions() {
    return this.#initialOptions;
  }

  /**
   * The initial options at creation (used to reset).
   */
  readonly #initialOptions: GetFixed<Options> & DefaultStaticOptions;

  /**
   * Private instance of the extension options.
   */
  #options: GetFixed<Options> & DefaultStaticOptions;

  /**
   * The mapped function handlers.
   */
  #mappedHandlers: GetMappedHandler<Options>;

  constructor(
    { validator, defaultOptions, code }: BaseClassConstructorParameter<DefaultStaticOptions>,
    ...parameters: ConstructorParameter<Options, DefaultStaticOptions>
  ) {
    validator(this.constructor, code);

    const [options] = parameters;
    this.#mappedHandlers = object();
    this.populateMappedHandlers();

    this.#options = this.#initialOptions = deepMerge(
      defaultOptions,
      this.constructor.defaultOptions,
      options ?? object(),
      this.createDefaultHandlerOptions(),
    );

    // Triggers the `init` options update for this extension.
    this.init();
  }

  /**
   * This method is called by the extension constructor. It is not strictly a
   * lifecycle method since at this point the manager has not yet been
   * instantiated.
   *
   * @remarks
   *
   * It should be used instead of overriding the constructor which can lead to
   * problems.
   *
   * At this point
   * - `this.store` will throw an error since it doesn't yet exist.
   * - `this.type` in `NodeExtension` and `MarkExtension` will also throw an
   *   error since the schema hasn't been created yet.
   */
  protected init() {}

  /**
   * Update the properties with the provided partial value when changed.
   */
  setOptions(update: GetPartialDynamic<Options>) {
    const previousOptions = this.getDynamicOptions();

    const { changes, options, pickChanged } = getChangedOptions({
      previousOptions,
      update,
    });

    // Trigger the update handler so the extension can respond to any relevant property
    // updates.
    this.onSetOptions?.({
      reason: 'set',
      changes,
      options,
      pickChanged,
      initialOptions: this.#initialOptions,
    });

    this.updateDynamicOptions(options);
  }

  /**
   * Reset the extension properties to their default values.
   *
   * @nonVirtual
   */
  resetOptions() {
    const previousOptions = this.getDynamicOptions();
    const { changes, options, pickChanged } = getChangedOptions<Options>({
      previousOptions,
      update: this.#initialOptions,
    });

    this.updateDynamicOptions(options);

    // Trigger the update handler so that child extension properties can also be
    // updated.
    this.onSetOptions?.({
      reason: 'reset',
      options,
      changes,
      pickChanged,
      initialOptions: this.#initialOptions,
    });
  }

  /**
   * Override this to receive updates whenever the options have been updated on
   * this instance. This method is called after the updates have already been
   * applied to the instance. If you need more control over exactly how the
   * option should be applied you should set the option to be `Custom`.
   *
   * **Please Note**:
   *
   * This must be defined as a instance method and not a property since it is
   * called in the constructor.
   *
   * ```ts
   * class ThisPreset extends Preset {
   *   // GOOD ✅
   *   onSetOptions(parameter: OnSetOptionsParameter<Options>) {}
   *
   *    // BAD ❌
   *   onSetOptions = (parameter: OnSetOptionsParameter<Options>) => {}
   * }
   * ```
   *
   * @abstract
   */
  protected onSetOptions?(parameter: OnSetOptionsParameter<Options>): void;

  /**
   * Update the private options.
   */
  private getDynamicOptions(): GetFixedDynamic<Options> {
    return omit(this.#options, [
      ...this.constructor.customHandlerKeys,
      ...this.constructor.handlerKeys,
    ]) as any;
  }

  /**
   * Update the dynamic options.
   */
  private updateDynamicOptions(options: GetFixedDynamic<Options>) {
    this.#options = { ...this.#options, ...options };
  }

  /**
   * Set up the mapped handlers object with default values (an empty array);
   */
  private populateMappedHandlers() {
    for (const key of this.constructor.handlerKeys as HandlerKeyList<Options>) {
      this.#mappedHandlers[key] = [];
    }
  }

  /**
   * This is currently fudged together, I'm not sure it will work.
   */
  private createDefaultHandlerOptions() {
    const methods = object<any>();
    for (const key of this.constructor.handlerKeys as HandlerKeyList<Options>) {
      methods[key] = (...args: any[]) => {
        this.#mappedHandlers[key].forEach((handler) =>
          ((handler as unknown) as AnyFunction)(...args),
        );
      };
    }

    return methods;
  }

  /**
   * Add a handler to the event handlers so that it is called along with all
   * the other handler methods.
   *
   * This is helpful for integrating react hooks which can be used in multiple
   * places. The original problem with fixed properties is that you can only
   * assign to a method once and it overwrites any other methods. This pattern
   * for adding handlers allows for multiple usages of the same handler in the
   * most relevant part of the code.
   *
   * More to come on this pattern.
   *
   * @nonVirtual
   */
  addHandler: AddHandler<Options> = (key, method) => {
    this.#mappedHandlers[key].push(method);

    // Return a method for disposing of the handler.
    return () =>
      (this.#mappedHandlers[key] = this.#mappedHandlers[key].filter(
        (handler) => handler !== method,
      ));
  };

  /**
   * A method that can be used to add a custom handler. It is up to the
   * extension creator to manage the handlers and dispose methods.
   */
  addCustomHandler = <Key extends keyof GetCustomHandler<Options>>(
    key: Key,
    value: Required<GetCustomHandler<Options>>[Key],
  ): Dispose => {
    return this.onAddCustomHandler?.({ [key]: value } as any) ?? noop;
  };

  /**
   * Override this method if you want to set custom handlers on your extension.
   *
   * This must return a dispose function.
   */
  protected onAddCustomHandler?: AddCustomHandler<Options>;
}

/**
 * @internal
 */
export type CustomHandlerMethod<Options extends ValidOptions> = <
  Key extends keyof GetCustomHandler<Options>
>(
  key: Key,
  value: Required<GetCustomHandler<Options>>[Key],
) => Dispose;

export type AddCustomHandler<Options extends ValidOptions> = (
  parameter: Partial<GetCustomHandler<Options>>,
) => Dispose | undefined;

export type AddHandler<Options extends ValidOptions> = <Key extends keyof GetHandler<Options>>(
  key: Key,
  method: GetHandler<Options>[Key],
) => Dispose;

/**
 * TODO see if this is needed or remove.
 */
export type AddHandlers<Options extends ValidOptions> = (
  parameter: Partial<GetHandler<Options>>,
) => Dispose;

export interface BaseClass<
  Options extends ValidOptions,
  DefaultStaticOptions extends Shape = EmptyShape
> {
  constructor: BaseClassConstructor<Options, DefaultStaticOptions>;
}

export interface BaseClassConstructor<
  Options extends ValidOptions = EmptyShape,
  DefaultStaticOptions extends Shape = EmptyShape
> extends Function {
  new (...parameters: ConstructorParameter<Options, DefaultStaticOptions>): any;

  /**
   * The identifier for the constructor which can determine whether it is a node
   * constructor, mark constructor or plain constructor.
   * @internal
   */
  readonly [__INTERNAL_REMIRROR_IDENTIFIER_KEY__]: RemirrorIdentifier;

  /**
   * Defines the `defaultOptions` for all extension instances.
   *
   * @remarks
   *
   * Once set it can't be updated during run time. Some of the settings are
   * optional and some are not. Any non-required settings must be specified in
   * the `defaultOptions`.
   *
   * **Please note**: There is a slight downside when setting up
   * `defaultOptions`. `undefined` is not supported for partial settings at
   * this point in time. As a workaround use `null` as the type and pass it as
   * the value in the default settings.
   *
   * @defaultValue `{}`
   *
   * @internal
   */
  readonly defaultOptions: DefaultOptions<Options, DefaultStaticOptions>;

  /**
   * An array of the keys that are static for this extension.
   *
   * This is actually currently unused, but might become useful in the future.
   * An auto-fix lint rule will be added should that be the case.
   */
  readonly staticKeys: string[];

  /**
   * An array of all the keys which correspond to the the event handler options.
   *
   * This **MUST** be present if you want to use event handlers in your extension.
   *
   * Every key here is automatically removed from the `setOptions` method and is
   * added to the `addHandler` method for adding new handlers. The
   * `this.options[key]` is automatically replaced with a method that combines
   * all the handlers into one method that can be called effortlessly. All this
   * work is done for you.
   */
  readonly handlerKeys: string[];

  /**
   * A list of the custom keys in the extension or preset options.
   */
  readonly customHandlerKeys: string[];
}

export type AnyBaseClassConstructor = Replace<
  BaseClassConstructor<any, any>,
  // eslint-disable-next-line @typescript-eslint/prefer-function-type
  { new (...args: any[]): AnyFunction }
>;

/* eslint-enable @typescript-eslint/member-ordering */

/**
 * Auto infers the parameter for the constructor. If there is a
 * required static option then the TypeScript compiler will error if nothing is
 * passed in.
 */
export type ConstructorParameter<
  Options extends ValidOptions,
  DefaultStaticOptions extends Shape
> = IfNoRequiredProperties<
  GetStatic<Options>,
  [(GetConstructorParameter<Options> & DefaultStaticOptions)?],
  [GetConstructorParameter<Options> & DefaultStaticOptions]
>;

/**
 * Get the expected type signature for the `defaultOptions`. Requires that
 * every optional setting key (except for keys which are defined on the
 * `BaseExtensionOptions`) has a value assigned.
 */
export type DefaultOptions<
  Options extends ValidOptions,
  DefaultStaticOptions extends Shape
> = UndefinedFlipPartialAndRequired<GetStatic<Options>> &
  Partial<DefaultStaticOptions> &
  GetFixedDynamic<Options>;

/**
 * Checks that the extension has a valid constructor with the `defaultOptions`
 * and `defaultProperties` defined as static properties.
 */
export function isValidConstructor(
  Constructor: BaseClassConstructor<any, any>,
  code: ErrorConstant,
): asserts Constructor {
  invariant(isPlainObject(Constructor.defaultOptions), {
    message: `No static 'defaultOptions' provided for '${Constructor.name}'.\n`,
    code,
  });

  invariant(isArray(Constructor.staticKeys), {
    message: `No static 'staticKeys' provided for '${Constructor.name}'.\n`,
    code,
  });

  invariant(isArray(Constructor.handlerKeys), {
    message: `No static 'handlerKeys' provided for '${Constructor.name}'.\n`,
    code,
  });

  invariant(isArray(Constructor.customHandlerKeys), {
    message: `No static 'customHandlerKeys' provided for '${Constructor.name}'.\n`,
    code,
  });
}

export interface AnyBaseClassOverrides {
  addCustomHandler: AnyFunction;
  addHandler: AnyFunction;
  clone: AnyFunction;
}
