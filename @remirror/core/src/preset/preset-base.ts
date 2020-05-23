/* eslint-disable @typescript-eslint/explicit-member-accessibility */
import {
  ErrorConstant,
  REMIRROR_IDENTIFIER_KEY,
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
  IfNoRequiredProperties,
  Shape,
} from '@remirror/core-types';

import { AnyExtension, AnyExtensionConstructor, WithProperties } from '../extension';
import { getChangedProperties, GetChangedPropertiesReturn } from '../helpers';
import {
  DefaultPropertiesParameter,
  PropertiesUpdateReason,
  PropertiesUpdateReasonParameter,
} from '../types';

/**
 * A preset is our way of bundling similar extensions with unified
 * settings and dynamic properties.
 */
export abstract class Preset<
  Settings extends Shape = EmptyShape,
  Properties extends Shape = EmptyShape
> {
  /**
   * The default settings for this preset.
   */
  public static readonly defaultSettings = {};

  /**
   * The default properties for this preset.
   */
  public static readonly defaultProperties = {};
  /**
   * The preset constructor identifier key.
   *
   * @internal
   */
  static get [REMIRROR_IDENTIFIER_KEY]() {
    return RemirrorIdentifier.PresetConstructor as const;
  }
  /**
   * The remirror identifier key.
   *
   * @internal
   */
  get [REMIRROR_IDENTIFIER_KEY]() {
    return RemirrorIdentifier.Preset as const;
  }

  /**
   * The `camelCased` name of the preset.
   */
  public abstract readonly name: string;

  get settings() {
    return this.#settings;
  }

  get properties() {
    return this.#properties;
  }

  get extensions() {
    return this.#extensions;
  }

  /**
   * Private instance of the presets static settings.
   */
  #settings: Required<Settings>;

  /**
   * Private instance of the presets dynamic properties.
   */
  #properties: Readonly<Required<Properties>>;

  /**
   * Private list of extension stored in within this preset.
   */
  #extensions: Array<this['~E']>;

  /**
   * An extension mapping of the extensions and their constructors.
   */
  #extensionMap = new Map<this['~E']['constructor'], this['~E']>();

  /**
   * Keep track of whether this extension has been initialized or not.
   */
  #hasInitialized = false;

  constructor(...parameters: PresetConstructorParameter<Settings, Properties>) {
    isValidPresetConstructor(this.constructor);
    const [settings] = parameters;

    // Create the preset settings.
    this.#settings = deepMerge(object(), {
      ...this.constructor.defaultSettings,
      ...settings,
    });

    // Create the preset properties.
    this.#properties = { ...this.constructor.defaultProperties, ...settings?.properties };

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
    this.setProperties(this.#properties);
    this.#hasInitialized = true;
  }

  /**
   * Create the extensions which will be consumed by the preset.
   */
  public abstract createExtensions(): AnyExtension[];

  /**
   * Called every time properties for this extension are set or reset. This is
   * also called when the extension is first created with the default properties.
   */
  protected abstract onSetProperties(parameter: SetPresetPropertiesParameter<Properties>): void;

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
   * Calls the `onSetProperties` parameter property when creating the constructor.
   */
  public setProperties(update: Partial<Properties>) {
    const reason: PropertiesUpdateReason = this.#hasInitialized ? 'set' : 'init';
    const previousProperties = this.#properties;
    const { changes, properties } = getChangedProperties({
      previousProperties,
      update,
    });

    // Trigger the update handler so that child extension properties can also be
    // updated.
    this.onSetProperties({
      reason,
      changes,
      properties,
      defaultProperties: this.constructor.defaultProperties,
    });

    // The constructor already sets the properties to their default values.
    if (reason === 'init') {
      return;
    }

    // Update the stored properties value.
    this.#properties = properties;
  }

  public resetProperties() {
    const previousProperties = this.#properties;
    const { changes, properties } = getChangedProperties({
      previousProperties,
      update: this.constructor.defaultProperties,
    });

    // Trigger the update handler so that child extension properties can also be
    // updated.
    this.onSetProperties({
      reason: 'reset',
      properties,
      changes,
      defaultProperties: this.constructor.defaultProperties,
    });

    // Update the stored properties value.
    this.#properties = properties;
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

export interface Preset<
  Settings extends Shape = EmptyShape,
  Properties extends Shape = EmptyShape
> {
  /**
   * The typed constructor for the `Preset` instance.
   */
  constructor: PresetConstructor<Settings, Properties>;

  /**
   * Not for public usage. This is purely for types to make it easier to infer
   * the type of `Settings` on an extension instance.
   */
  ['~S']: Settings;

  /**
   * Not for public usage. This is purely for types to make it easier to infer
   * the type of `Settings` on an extension instance.
   */
  ['~P']: Properties;

  /**
   * Not for public usage. This is purely for types to make it easier to infer
   * available extension types.
   */
  ['~E']: ReturnType<this['createExtensions']>[number];
}

export interface SetPresetPropertiesParameter<Properties extends Shape = object>
  extends DefaultPropertiesParameter<Properties>,
    GetChangedPropertiesReturn<Properties>,
    PropertiesUpdateReasonParameter {}

/**
 * The type which is applicable to any `Preset` instances.
 */
export type AnyPreset = Omit<Preset<any, any>, 'constructor'> & {
  constructor: AnyPresetConstructor;
};

/**
 * The type which is applicable to any `Preset` constructor.
 */
export type AnyPresetConstructor = PresetConstructor<any, any>;

export type DefaultPresetSettings<Settings extends Shape> = FlipPartialAndRequired<Settings>;

/**
 *
 */
export interface PresetConstructor<
  Settings extends Shape = object,
  Properties extends Shape = object
> extends Function {
  /**
   * The identifier for the constructor which identifies it as a preset constructor.
   * @internal
   */
  readonly [REMIRROR_IDENTIFIER_KEY]: RemirrorIdentifier;

  /**
   * Default settings.
   */
  readonly defaultSettings: DefaultPresetSettings<Settings>;

  /**
   * Default properties.
   */
  readonly defaultProperties: Required<Properties>;

  new (...args: PresetConstructorParameter<Settings, Properties>): Preset<Settings, Shape>;
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
 * Checks that the preset has a valid constructor with the `defaultSettings`
 * and `defaultProperties` defined as static properties.
 */
export function isValidPresetConstructor(
  Constructor: unknown,
): asserts Constructor is AnyPresetConstructor {
  invariant(isPresetConstructor(Constructor), {
    message: 'This is not a valid extension constructor',
    code: ErrorConstant.INVALID_PRESET,
  });

  invariant(isPlainObject(Constructor.defaultSettings), {
    message: `No static 'defaultSettings' provided for '${Constructor.name}'.\n`,
    code: ErrorConstant.INVALID_PRESET,
  });

  invariant(isPlainObject(Constructor.defaultProperties), {
    message: `No static 'defaultProperties' provided for '${Constructor.name}'.\n`,
    code: ErrorConstant.INVALID_PRESET,
  });
}

/**
 * Automatically infers whether the constructor parameter is required for the
 * Preset.
 *
 * - Required when any of the settings are not optional.
 */
export type PresetConstructorParameter<
  Settings extends Shape,
  Properties extends Shape
> = IfNoRequiredProperties<
  Settings,
  [WithProperties<Settings, Properties>?],
  [WithProperties<Settings, Properties>]
>;

/* eslint-enable @typescript-eslint/explicit-member-accessibility */
