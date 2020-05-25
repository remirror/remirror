/* eslint-disable @typescript-eslint/explicit-member-accessibility */
import {
  __INTERNAL_REMIRROR_IDENTIFIER_KEY__,
  ErrorConstant,
  RemirrorIdentifier,
} from '@remirror/core-constants';
import {
  deepMerge,
  invariant,
  isIdentifierOfType,
  isPlainObject,
  isRemirrorType,
  object,
  uniqueBy,
} from '@remirror/core-helpers';
import {
  EmptyShape,
  FlipPartialAndRequired,
  GetDynamic,
  GetFixed,
  GetPartialDynamic,
  GetStatic,
  IfNoRequiredProperties,
  ValidOptions,
} from '@remirror/core-types';

import { AnyExtension, AnyExtensionConstructor } from '../extension';
import { getChangedOptions } from '../helpers';
import { SetOptionsParameter, UpdateReason } from '../types';

/**
 * A preset is our way of bundling similar extensions with unified options and
 * dynamic properties.
 */
export abstract class Preset<Options extends ValidOptions = EmptyShape> {
  /**
   * The default options for this preset.
   */
  public static readonly defaultOptions = {};

  /**
   * The preset constructor identifier key.
   *
   * @internal
   */
  static get [__INTERNAL_REMIRROR_IDENTIFIER_KEY__]() {
    return RemirrorIdentifier.PresetConstructor as const;
  }
  /**
   * The remirror identifier key.
   *
   * @internal
   */
  get [__INTERNAL_REMIRROR_IDENTIFIER_KEY__]() {
    return RemirrorIdentifier.Preset as const;
  }

  /**
   * The `camelCased` name of the preset.
   */
  public abstract readonly name: string;

  /**
   * The preset options.
   */
  get options() {
    return this.#options;
  }

  get extensions() {
    return this.#extensions;
  }

  /**
   * The extension options.
   */
  #options: GetFixed<Options>;

  /**
   * The initial options, used when resetting.
   */
  readonly #initialOptions: GetFixed<Options>;

  /**
   * Private list of extension stored in within this preset.
   */
  #extensions: Array<this['~E']>;

  /**
   * An extension mapping of the extensions and their constructors.
   */
  #extensionMap = new Map<this['~E']['constructor'], this['~E']>();

  /**
   * Keep track of whether this preset has been initialized or not.
   */
  #hasInitialized = false;

  constructor(...parameters: PresetConstructorParameter<Options>) {
    isValidPresetConstructor(this.constructor);
    const [options] = parameters;

    // Create the preset options.
    this.#options = this.#initialOptions = deepMerge(object(), {
      ...this.constructor.defaultOptions,
      ...options,
    });

    // Create the extension list.
    this.#extensions = uniqueBy(
      this.createExtensions(),
      // Ensure that all the provided extensions are unique.
      (extension) => extension.constructor,
    );

    // Create the extension map.
    for (const extension of this.#extensions) {
      this.#extensionMap.set(extension.constructor, extension);
    }

    // Triggers the `init` properties update for this extension.
    this.setOptions(this.#options);
    this.#hasInitialized = true;
  }

  /**
   * Create the extensions which will be consumed by the preset.
   */
  public abstract createExtensions(): AnyExtension[];

  /**
   * Called every time properties for this extension are set or reset. This is
   * also called when the extension is first created with the default
   * properties.
   */
  protected abstract onSetOptions(parameter: SetOptionsParameter<Options>): void;

  /**
   * When there are duplicate extensions used within the editor the extension
   * manager will call this method and make sure all presets are using the same
   * instance of the `ExtensionConstructor`.
   */
  public replaceExtension(constructor: AnyExtensionConstructor, extension: this['~E']): void {
    if (this.#extensionMap.has(constructor)) {
      this.#extensionMap.set(constructor, extension);
    }
  }

  /**
   * Set the properties of the preset.
   *
   * Calls the `onSetOptions` parameter property when creating the
   * constructor.
   */
  public setOptions(update: GetPartialDynamic<Options>) {
    const reason: UpdateReason = this.#hasInitialized ? 'set' : 'init';
    const previousOptions = this.#options;
    const { changes, options } = getChangedOptions<Options>({
      previousOptions: previousOptions,
      update,
    });

    // Trigger the update handler so that child extension properties can also be
    // updated.
    this.onSetOptions({
      reason,
      changes,
      options,
      initialOptions: this.#initialOptions,
    });

    // The constructor already sets the properties to their default values.
    if (reason === 'init') {
      return;
    }

    // Update the stored properties value.
    this.#options = options;
  }

  public resetOption() {
    const previousOptions = this.#options;
    const { changes, options } = getChangedOptions({
      previousOptions: previousOptions,
      update: this.constructor.defaultOptions,
    });

    // Trigger the update handler so that child extension properties can also be
    // updated.
    this.onSetOptions({
      reason: 'reset',
      options,
      changes,
      initialOptions: this.#initialOptions,
    });

    // Update the stored properties value.
    this.#options = options;
  }

  /**
   * Get an extension from the extension holder (either a preset or a manager)
   * that corresponds to the provided `Constructor`.
   *
   * @param Constructor - the extension constructor to find in the editor.
   *
   * @remarks
   *
   * This method will throw an error if the constructor doesn't exist.
   */
  public getExtension<Type extends this['~E']['constructor']>(
    Constructor: Type,
  ): InstanceType<Type> {
    const extension = this.#extensionMap.get(Constructor);

    // Throws an error if attempting to get an extension which is not available
    // in this preset.
    invariant(extension, {
      code: ErrorConstant.INVALID_PRESET_EXTENSION,
      message: `'${Constructor.name}' does not exist within the preset: '${this.name}'`,
    });

    return extension as InstanceType<Type>;
  }
}

export interface Preset<Options extends ValidOptions = EmptyShape> {
  /**
   * The typed constructor for the `Preset` instance.
   */
  constructor: PresetConstructor<Options>;

  /**
   * Not for public usage. This is purely for types to make it easier to infer
   * the type of `Options` on an extension instance.
   */
  ['~S']: Options;

  /**
   * Not for public usage. This is purely for types to make it easier to infer
   * the type of `Options` on an extension instance.
   */
  ['~P']: Options;

  /**
   * Not for public usage. This is purely for types to make it easier to infer
   * available extension types.
   */
  ['~E']: ReturnType<this['createExtensions']>[number];
}

/**
 * The type which is applicable to any `Preset` instances.
 */
export type AnyPreset = Omit<Preset<any>, keyof Remirror.AnyPresetOverrides> &
  Remirror.AnyPresetOverrides;

/**
 * The type which is applicable to any `Preset` constructor.
 */
export type AnyPresetConstructor = PresetConstructor<any>;

/**
 * The default preset options.
 *
 * - `StaticOptions` - It works by making all partial properties required and all required
 * properties partial.
 * - `DynamicOptions` - All properties must have a default value whether default
 *   or required
 * -  1
 */
export type DefaultPresetOptions<Options extends ValidOptions> = FlipPartialAndRequired<
  GetStatic<Options>
> &
  Required<GetDynamic<Options>>;

/**
 * The preset constructor. This is used to annotate the Preset class since
 * TypeScript doesn't automatically provide a meaningful type for the
 * `constructor` property.
 */
export interface PresetConstructor<Options extends ValidOptions = EmptyShape> extends Function {
  /**
   * The identifier for the constructor which identifies it as a preset
   * constructor.
   * @internal
   */
  readonly [__INTERNAL_REMIRROR_IDENTIFIER_KEY__]: RemirrorIdentifier;

  /**
   * Default options.
   */
  readonly defaultOptions: DefaultPresetOptions<Options>;

  new (...args: PresetConstructorParameter<Options>): Preset<Options>;
}

/**
 * Determines if the passed in value is a preset.
 *
 * @param value - the preset to check
 */
export function isPreset(value: unknown): value is AnyPreset {
  return isRemirrorType(value) && isIdentifierOfType(value, RemirrorIdentifier.Preset);
}

/**
 * Determines if the passed in value is a preset constructor.
 *
 * @param value - the value to test
 */
export function isPresetConstructor(value: unknown): value is AnyPresetConstructor {
  return isRemirrorType(value) && isIdentifierOfType(value, RemirrorIdentifier.PresetConstructor);
}

/**
 * Checks that the preset has a valid constructor with the `defaultOptions` and
 * `defaultOptions` defined as static properties.
 */
export function isValidPresetConstructor(
  Constructor: unknown,
): asserts Constructor is AnyPresetConstructor {
  invariant(isPresetConstructor(Constructor), {
    message: 'This is not a valid extension constructor',
    code: ErrorConstant.INVALID_PRESET,
  });

  invariant(isPlainObject(Constructor.defaultOptions), {
    message: `No static 'defaultOptions' provided for '${Constructor.name}'.\n`,
    code: ErrorConstant.INVALID_PRESET,
  });

  invariant(isPlainObject(Constructor.defaultOptions), {
    message: `No static 'defaultOptions' provided for '${Constructor.name}'.\n`,
    code: ErrorConstant.INVALID_PRESET,
  });
}

/**
 * Automatically infers whether the constructor parameter is required for the
 * Preset.
 *
 * - Required when any of the options are not optional.
 */
export type PresetConstructorParameter<Options extends ValidOptions> = IfNoRequiredProperties<
  GetStatic<Options>,
  [(GetStatic<Options> & GetPartialDynamic<Options>)?],
  [GetStatic<Options> & GetPartialDynamic<Options>]
>;

/* eslint-enable @typescript-eslint/explicit-member-accessibility */

declare global {
  namespace Remirror {
    /**
     * An override to for the `AnyPreset` type. If you're Preset adds a new
     * property to the `Preset` that is deeply nested or very complex it can
     * break the `AnyPreset` implementation from being compatible with all valid
     * Presets.
     *
     * The keys you provide on this override replace the default `AnyPreset`
     * types include unsafe properties that need to be simplified.
     *
     * An example is the `constructor` property which makes it impossible to
     * find a common interface between presets with different options and
     * properties. By setting the `constructor` to a much simpler override all
     * `Preset`'s are now assignable to the `AnyPreset type again.`
     */
    interface AnyPresetOverrides {
      constructor: AnyPresetConstructor;
    }
  }
}
