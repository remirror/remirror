/* eslint-disable @typescript-eslint/member-ordering */

import type { LiteralUnion, Primitive } from 'type-fest';

import {
  __INTERNAL_REMIRROR_IDENTIFIER_KEY__,
  ErrorConstant,
  ExtensionPriority,
  RemirrorIdentifier,
} from '@remirror/core-constants';
import {
  camelCase,
  deepMerge,
  invariant,
  isArray,
  isEmptyArray,
  isFunction,
  isPlainObject,
  keys,
  noop,
  object,
  omit,
  sort,
} from '@remirror/core-helpers';
import type {
  AnyFunction,
  Dispose,
  EmptyShape,
  GetAcceptUndefined,
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
  MakeUndefined,
  Replace,
  Shape,
  StringKey,
  UndefinedFlipPartialAndRequired,
  ValidOptions,
} from '@remirror/core-types';

import { getChangedOptions } from '../helpers';
import type { OnSetOptionsParameter } from '../types';

interface BaseClassConstructorParameter<DefaultStaticOptions extends Shape = EmptyShape> {
  validator: (Constructor: unknown, code: ErrorConstant) => void;
  code: ErrorConstant;
  defaultOptions: DefaultStaticOptions;
}

const IGNORE = '__IGNORE__';
const GENERAL_OPTIONS = '__ALL__' as const;

export abstract class BaseClass<
  Options extends ValidOptions = EmptyShape,
  DefaultStaticOptions extends Shape = EmptyShape
> {
  /**
   * The default options for this extension.
   *
   * TODO see if this can be cast to something other than any and allow
   * composition.
   */
  static readonly defaultOptions: any = {};

  /**
   * The static keys for this class.
   */
  static readonly staticKeys: string[] = [];

  /**
   * The event handler keys.
   */
  static readonly handlerKeys: string[] = [];

  /**
   * Customize the way the handler should behave.
   */
  static handlerKeyOptions: Partial<
    Record<string, HandlerKeyOptions> & { [GENERAL_OPTIONS]?: HandlerKeyOptions }
  > = {};

  /**
   * The custom keys.
   */
  static readonly customHandlerKeys: string[] = [];

  /**
   * Get the instance name of the instance from the constructor.
   *
   * - `'CorePreset'` => `'core'`
   * - `'AwesomeNodeExtension'` => `'awesomeNode'`
   *
   * The solution was adapted from https://stackoverflow.com/a/7888303/2172153.
   */
  static get instanceName(): string {
    // Make sure to camelCase the string (so that the first letter is
    // lowercase). `'BoldExtension'` => `'boldExtension'`
    return camelCase(
      this.name
        // Split by capitals `'boldExtension'` => `['bold', 'Extension']`.
        .split(/(?=[A-Z])/)
        // Drop the last index. `['bold', 'Extension']` => `['bold']`.
        .slice(0, -1)
        // Rejoin the word `['bold']` => `'bold'`.
        .join(''),
    );
  }

  /**
   * This is not for external use. It is purely here for TypeScript inference of
   * the generic `Options` type parameter.
   */
  ['~O']: Options & DefaultStaticOptions;

  /**
   * This identifies this as a `Remirror` object. .
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
  get options(): GetFixed<Options> & DefaultStaticOptions {
    return this.#options;
  }

  /**
   * Get the dynamic keys for this extension.
   */
  get dynamicKeys(): string[] {
    return this.#dynamicKeys;
  }

  /**
   * The options that this instance was created with, merged with all the
   * default options.
   */
  get initialOptions(): GetFixed<Options> & DefaultStaticOptions {
    return this.#initialOptions;
  }

  /**
   * The initial options at creation (used to reset).
   */
  readonly #initialOptions: GetFixed<Options> & DefaultStaticOptions;

  /**
   * All the dynamic keys supported by this extension.
   */
  readonly #dynamicKeys: string[];

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

    this.#dynamicKeys = this.getDynamicKeys();

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
  protected init(): void {}

  /**
   * Clone the current instance with the provided options. If nothing is
   * provided it uses the same initial options as the current instance.
   */
  abstract clone(
    ...parameters: ConstructorParameter<Options, DefaultStaticOptions>
  ): BaseClass<Options, DefaultStaticOptions>;

  /**
   * Get the dynamic keys for this extension.
   */
  private getDynamicKeys(): string[] {
    const dynamicKeys: string[] = [];
    const { customHandlerKeys, handlerKeys, staticKeys } = this.constructor;

    for (const key of keys(this.#options)) {
      if (
        staticKeys.includes(key) ||
        handlerKeys.includes(key) ||
        customHandlerKeys.includes(key)
      ) {
        continue;
      }

      dynamicKeys.push(key);
    }

    return dynamicKeys;
  }

  /**
   * Throw an error if non dynamic keys are updated.
   */
  private ensureAllKeysAreDynamic(update: GetPartialDynamic<Options>) {
    if (process.env.NODE_ENV === 'production') {
      return;
    }

    const invalid: string[] = [];

    for (const key of keys(update)) {
      if (this.#dynamicKeys.includes(key)) {
        continue;
      }

      invalid.push(key);
    }

    invariant(isEmptyArray(invalid), {
      code: ErrorConstant.INVALID_SET_EXTENSION_OPTIONS,
      message: `Invalid properties passed into the 'setOptions()' method: ${JSON.stringify(
        invalid,
      )}.`,
    });
  }

  /**
   * Update the properties with the provided partial value when changed.
   */
  setOptions(update: GetPartialDynamic<Options>): void {
    const previousOptions = this.getDynamicOptions();

    this.ensureAllKeysAreDynamic(update);

    const { changes, options, pickChanged } = getChangedOptions({
      previousOptions,
      update,
    });

    this.updateDynamicOptions(options);

    // Trigger the update handler so the extension can respond to any relevant
    // property updates.
    this.onSetOptions?.({
      reason: 'set',
      changes,
      options,
      pickChanged,
      initialOptions: this.#initialOptions,
    });
  }

  /**
   * Reset the extension properties to their default values.
   *
   * @nonVirtual
   */
  resetOptions(): void {
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
        let returnValue: unknown;

        for (const [, handler] of this.#mappedHandlers[key]) {
          returnValue = ((handler as unknown) as AnyFunction)(...args);
          const { handlerKeyOptions } = this.constructor;

          // Check if the method should cause an early return, based on the
          // return value.
          if (shouldReturnEarly(handlerKeyOptions, returnValue, key)) {
            return returnValue;
          }
        }

        return returnValue;
      };
    }

    return methods;
  }

  /**
   * Add a handler to the event handlers so that it is called along with all the
   * other handler methods.
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
  addHandler<Key extends keyof GetHandler<Options>>(
    key: Key,
    method: GetHandler<Options>[Key],
    priority = ExtensionPriority.Default,
  ): Dispose {
    this.#mappedHandlers[key].push([priority, method]);
    this.sortHandlers(key);

    // Return a method for disposing of the handler.
    return () =>
      (this.#mappedHandlers[key] = this.#mappedHandlers[key].filter(
        ([, handler]) => handler !== method,
      ));
  }

  private sortHandlers<Key extends keyof GetHandler<Options>>(key: Key) {
    this.#mappedHandlers[key] = sort(
      this.#mappedHandlers[key],
      // Sort from highest binding to the lowest.
      ([a], [z]) => z - a,
    );
  }

  /**
   * A method that can be used to add a custom handler. It is up to the
   * extension creator to manage the handlers and dispose methods.
   */
  addCustomHandler<Key extends keyof GetCustomHandler<Options>>(
    key: Key,
    value: Required<GetCustomHandler<Options>>[Key],
  ): Dispose {
    return this.onAddCustomHandler?.({ [key]: value } as any) ?? noop;
  }

  /**
   * Override this method if you want to set custom handlers on your extension.
   *
   * This must return a dispose function.
   */
  protected onAddCustomHandler?: AddCustomHandler<Options>;
}

type HandlerKeyOptionsMap = Partial<
  Record<string, HandlerKeyOptions> & { [GENERAL_OPTIONS]?: HandlerKeyOptions }
>;

/**
 * A function used to determine whether the value provided by the handler
 * warrants an early return.
 */
function shouldReturnEarly(
  handlerKeyOptions: HandlerKeyOptionsMap,
  returnValue: unknown,
  handlerKey: string,
): boolean {
  const { [GENERAL_OPTIONS]: generalOptions } = handlerKeyOptions;
  const handlerOptions = handlerKeyOptions[handlerKey];

  if (!generalOptions && !handlerOptions) {
    return false;
  }

  // First check if there are options set for the provided handlerKey
  if (
    handlerOptions &&
    // Only proceed if the value should not be ignored.
    handlerOptions.earlyReturnValue !== IGNORE &&
    (isFunction(handlerOptions.earlyReturnValue)
      ? handlerOptions.earlyReturnValue(returnValue) === true
      : returnValue === handlerOptions.earlyReturnValue)
  ) {
    return true;
  }

  if (
    generalOptions &&
    // Only proceed if they are not ignored.
    generalOptions.earlyReturnValue !== IGNORE &&
    // Check whether the `earlyReturnValue` is a predicate check.
    (isFunction(generalOptions.earlyReturnValue)
      ? // If it is a predicate and when called with the current
        // `returnValue` the value is `true` then we should return
        // early.
        generalOptions.earlyReturnValue(returnValue) === true
      : // Check the actual return value.
        returnValue === generalOptions.earlyReturnValue)
  ) {
    return true;
  }

  return false;
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

export interface HandlerKeyOptions {
  /**
   * When this value is encountered the handler will exit early.
   *
   * Set the value to `'__IGNORE__'` to ignore it
   */
  earlyReturnValue?: LiteralUnion<typeof IGNORE, Primitive> | ((value: unknown) => boolean);
}

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
   * `defaultOptions`. `undefined` is not supported for partial settings at this
   * point in time. As a workaround use `null` as the type and pass it as the
   * value in the default settings.
   *
   * @default {}
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
   * This **MUST** be present if you want to use event handlers in your
   * extension.
   *
   * Every key here is automatically removed from the `setOptions` method and is
   * added to the `addHandler` method for adding new handlers. The
   * `this.options[key]` is automatically replaced with a method that combines
   * all the handlers into one method that can be called effortlessly. All this
   * work is done for you.
   */
  readonly handlerKeys: string[];

  /**
   * Customize the way the handler should behave.
   */
  readonly handlerKeyOptions: Partial<
    Record<string, HandlerKeyOptions> & { __ALL__?: HandlerKeyOptions }
  >;

  /**
   * A list of the custom keys in the extension or preset options.
   */
  readonly customHandlerKeys: string[];

  /**
   * The instance name when instantiated.
   *
   * - `'CorePreset'` => `'core'`
   * - `'AwesomeNodeExtension'` => `'awesomeNode'`
   */
  readonly instanceName: string;
}

export type AnyBaseClassConstructor = Replace<
  BaseClassConstructor<any, any>,
  // eslint-disable-next-line @typescript-eslint/prefer-function-type
  { new (...args: any[]): AnyFunction }
>;

/* eslint-enable @typescript-eslint/member-ordering */

/**
 * Auto infers the parameter for the constructor. If there is a required static
 * option then the TypeScript compiler will error if nothing is passed in.
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
 * Get the expected type signature for the `defaultOptions`. Requires that every
 * optional setting key (except for keys which are defined on the
 * `BaseExtensionOptions`) has a value assigned.
 */
export type DefaultOptions<
  Options extends ValidOptions,
  DefaultStaticOptions extends Shape
> = MakeUndefined<
  UndefinedFlipPartialAndRequired<GetStatic<Options>> &
    Partial<DefaultStaticOptions> &
    GetFixedDynamic<Options>,
  StringKey<GetAcceptUndefined<Options>>
>;

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
