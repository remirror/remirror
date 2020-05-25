/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable @typescript-eslint/explicit-member-accessibility */
import {
  __INTERNAL_REMIRROR_IDENTIFIER_KEY__,
  ErrorConstant,
  RemirrorIdentifier,
} from '@remirror/core-constants';
import { deepMerge, invariant, isPlainObject, noop, object, omit } from '@remirror/core-helpers';
import {
  AnyFunction,
  Dispose,
  EmptyShape,
  FlipPartialAndRequired,
  GetConstructorParameter,
  GetCustom,
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
  ValidOptions,
} from '@remirror/core-types';

import { getChangedOptions } from '../helpers';
import { SetOptionsParameter, UpdateReason } from '../types';

export abstract class BaseClass<
  Options extends ValidOptions = EmptyShape,
  DefaultStaticOptions extends Shape = EmptyShape
> {
  /**
   * The default options for this extension.
   */
  public static defaultOptions = {};

  /**
   * The static keys for this class.
   */
  public static staticKeys: string[] = [];

  /**
   * The event handler keys.
   */
  public static handlerKeys: string[] = [];

  /**
   * The custom keys.
   */
  public static customKeys: string[] = [];

  /**
   * Not for public usage. This is purely for types to make it easier to infer
   * the type of `Settings` on an extension instance.
   */
  [Remirror._OPTIONS]: Options & DefaultStaticOptions;

  /**
   * The identifier for the extension which can determine whether it is a node,
   * mark or plain extension.
   * @internal
   */
  public abstract readonly [__INTERNAL_REMIRROR_IDENTIFIER_KEY__]: RemirrorIdentifier;

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
  public abstract readonly name: string;

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

  /**
   * Keep track of whether this extension has been initialized or not.
   */
  #hasInitialized = false;

  constructor(
    validator: (Constructor: unknown) => void,
    defaultOptions: DefaultStaticOptions,
    ...parameters: ConstructorParameter<Options, DefaultStaticOptions>
  ) {
    validator(this.constructor);

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
    this.setOptions(this.#options);
    this.#hasInitialized = true;

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
  public setOptions(update: GetPartialDynamic<Options>) {
    const previousOptions = this.getDynamicOptions();
    const reason: UpdateReason = this.#hasInitialized ? 'set' : 'init';

    const { changes, options } = getChangedOptions({
      previousOptions,
      update,
    });

    // Trigger the update handler so the extension can respond to any relevant property
    // updates.
    this.onSetOptions?.({
      reason,
      changes,
      options,
      initialOptions: this.#initialOptions,
    });

    if (reason === 'init') {
      // The constructor has already set the options so no need to update the
      // dynamic values.
      return;
    }

    this.updateDynamicOptions(options);
  }

  /**
   * Reset the extension properties to their default values.
   *
   * @nonVirtual
   */
  public resetOptions() {
    const previousOptions = this.getDynamicOptions();
    const { changes, options } = getChangedOptions<Options>({
      previousOptions,
      update: this.#initialOptions,
    });

    // Trigger the update handler so that child extension properties can also be
    // updated.
    this.onSetOptions?.({
      reason: 'reset',
      options,
      changes,
      initialOptions: this.#initialOptions,
    });

    this.updateDynamicOptions(options);
  }

  /**
   * Update the private options.
   */
  private getDynamicOptions(): GetFixedDynamic<Options> {
    return omit(this.#options, [
      ...this.constructor.customKeys,
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
   * Override this to received updates whenever `setOptions` is called.
   *
   * @abstract
   */
  protected onSetOptions?(parameter: SetOptionsParameter<Options>): void;

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
  public addHandler = <Key extends keyof GetHandler<Options>>(
    key: Key,
    method: GetHandler<Options>[Key],
  ): Dispose => {
    this.#mappedHandlers[key].push(method);

    // Return a method for disposing of the handler.
    return () =>
      (this.#mappedHandlers[key] = this.#mappedHandlers[key].filter(
        (handler) => handler !== method,
      ));
  };

  /**
   * A method that can be used to set the value of a custom option.
   */
  public setCustomOption = <Key extends keyof GetCustom<Options>>(
    key: Key,
    method: GetCustom<Options>[Key],
  ): Dispose => {
    return this.onSetCustomOption?.(key, method) ?? noop;
  };

  /**
   * Override this method if you want to set custom options on your extension.
   */
  public onSetCustomOption?: OnSetCustomOption<Options>;
}

export type OnSetCustomOption<Options extends ValidOptions> = <
  Key extends keyof GetCustom<Options>
>(
  key: Key,
  value: GetCustom<Options>[Key],
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
  readonly customKeys: string[];
}

export type AnyBaseClassConstructor = Replace<
  BaseClassConstructor<any, any>,
  // eslint-disable-next-line @typescript-eslint/prefer-function-type
  { new (...args: any[]): AnyFunction }
>;

/* eslint-enable @typescript-eslint/member-ordering */
/* eslint-enable @typescript-eslint/explicit-member-accessibility */

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
> = FlipPartialAndRequired<GetStatic<Options>> &
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

  invariant(isPlainObject(Constructor.staticKeys), {
    message: `No static 'defaultPriority' provided for '${Constructor.name}'.\n`,
    code,
  });

  invariant(isPlainObject(Constructor.staticKeys), {
    message: `No static 'staticKeys' provided for '${Constructor.name}'.\n`,
    code,
  });

  invariant(isPlainObject(Constructor.handlerKeys), {
    message: `No static 'handlerKeys' provided for '${Constructor.name}'.\n`,
    code,
  });

  invariant(isPlainObject(Constructor.customKeys), {
    message: `No static 'customKeys' provided for '${Constructor.name}'.\n`,
    code,
  });
}

export interface AnyBaseClassOverrides {
  onSetCustomOption?: AnyFunction;
}
