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
  isRemirrorType,
  object,
  uniqueBy,
} from '@remirror/core-helpers';
import { FlipPartialAndRequired, IfEmpty, IfNoRequiredProperties } from '@remirror/core-types';

import {
  AnyExtension,
  AnyExtensionConstructor,
  DefaultSettingsType,
  ExtensionFromConstructor,
  ExtensionsParameter,
  GetConstructor,
  GetExtensionParameter,
} from '../extension';
import {
  getChangedProperties,
  GetChangedPropertiesParameter,
  GetChangedPropertiesReturn,
} from '../helpers';
import { PropertiesShape } from '../types';

/**
 * The type which is applicable to any `Preset` instances.
 */
export type AnyPreset<ExtensionUnion extends AnyExtension = any> = Preset<ExtensionUnion, any, any>;

/**
 * The interface of a preset constructor. This is used to create an instance of
 * the preset in your editor.
 */
export interface PresetConstructor<
  ExtensionUnion extends AnyExtension,
  Settings extends object = {},
  Properties extends object = {}
> {
  /**
   * Create a new instance of the preset to be used in the extension manager.
   *
   * This is used to prevent the need for the `new` keyword which can lead to
   * problems.
   */
  of(
    ...settings: IfNoRequiredProperties<Settings, [Settings?], [Settings]>
  ): Preset<ExtensionUnion, Settings, Properties>;
}

/**
 * Determines if the passed in extension is any type of extension.
 *
 * @param value - the extension to check
 */
export const isPreset = <Settings extends object = any>(
  value: unknown,
): value is AnyExtension<Settings> =>
  isRemirrorType(value) && isIdentifierOfType(value, RemirrorIdentifier.Preset);

/**
 * A preset is our way of bundling similar extensions with unified
 * settings and dynamic properties.
 */
export abstract class Preset<
  ExtensionUnion extends AnyExtension,
  Settings extends object = {},
  Properties extends object = {}
>
  implements
    ExtensionsParameter<ExtensionUnion>,
    PropertiesShape<Properties>,
    GetExtensionParameter<ExtensionUnion> {
  /**
   * The remirror identifier key.
   *
   * @internal
   */
  get [REMIRROR_IDENTIFIER_KEY]() {
    return RemirrorIdentifier.Preset;
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
  #extensions: ExtensionUnion[];

  /**
   * An extension mapping of the extensions and their constructors.
   */
  #extensionMap = new Map<AnyExtensionConstructor, ExtensionUnion>();

  get parameter() {
    return this.getFactoryParameter();
  }

  get settings() {
    return this.#settings;
  }

  get properties() {
    return this.#properties;
  }

  get extensions(): readonly ExtensionUnion[] {
    return this.#extensions;
  }

  /**
   * Get the default properties for this preset.
   */
  get defaultProperties(): Required<Properties> {
    return this.parameter.defaultProperties ?? object();
  }

  /**
   * Get the default settings for the preset.
   */
  get defaultSettings(): DefaultSettingsType<Settings> {
    return this.parameter.defaultSettings ?? object();
  }

  constructor(...[settings]: IfNoRequiredProperties<Settings, [Settings?], [Settings]>) {
    // Create the preset settings.
    this.#settings = deepMerge(object(), {
      ...this.defaultSettings,
      ...settings,
    });

    // Create the preset properties.
    this.#properties = { ...this.defaultProperties };

    // Create the extension list.
    this.#extensions = uniqueBy(
      this.parameter.createExtensions({
        settings: this.settings,
        properties: this.properties,
      }),
      // Ensure that all the provided extensions are unique.
      (extension) => extension.constructor,
    );

    // Create the extension map.
    for (const extension of this.#extensions) {
      this.#extensionMap.set(extension.constructor, extension);
    }
  }

  abstract getFactoryParameter(): Readonly<
    PresetFactoryParameter<ExtensionUnion, Settings, Properties>
  >;

  /**
   * When there are duplicate extensions used within the editor the extension
   * manager will call this method and make sure all preset are using the same
   * instance of the `ExtensionConstructor`.
   */
  public replaceExtension(constructor: AnyExtensionConstructor, extension: ExtensionUnion): void {
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
    const previous = this.#properties;
    const { changes, next } = getChangedProperties({ previous, update });

    // Trigger the update handler so that child extension properties can also be
    // updated.
    this.parameter.onSetProperties({
      previous,
      changes,
      update,
      next,
      defaultProperties: this.defaultProperties,
      settings: this.settings,
      getExtension: this.getExtension,
    });

    // Update the stored properties value.
    this.#properties = next;
  }

  public resetProperties() {
    const previous = this.#properties;
    const update = this.defaultProperties;
    const { changes, next } = getChangedProperties({ previous, update });

    // Trigger the update handler so that child extension properties can also be
    // updated.
    this.parameter.onResetProperties({
      previous,
      changes,
      defaultProperties: update,
      settings: this.settings,
      getExtension: this.getExtension,
    });

    // Update the stored properties value.
    this.#properties = next;
  }

  public getExtension = <ExtensionConstructor extends GetConstructor<ExtensionUnion>>(
    Constructor: ExtensionConstructor,
  ): ExtensionFromConstructor<ExtensionConstructor> => {
    const extension = this.#extensionMap.get(Constructor);

    // Throws an error if attempting to get an extension which is not preset
    // in this preset.
    invariant(extension, { code: ErrorConstant.INVALID_PRESET_EXTENSION });

    return extension as ExtensionFromConstructor<typeof Constructor>;
  };
}

interface CreateExtensionsParameter<Settings extends object = {}, Properties extends object = {}>
  extends PropertiesParameter<Properties>,
    SettingsParameter<Settings> {}

interface SetPropertiesParameter<
  ExtensionUnion extends AnyExtension,
  Settings extends object = {},
  Properties extends object = {}
>
  extends Omit<GetChangedPropertiesParameter<Properties>, 'equals'>,
    GetExtensionParameter<ExtensionUnion>,
    DefaultPropertiesParameter<Properties>,
    GetChangedPropertiesReturn<Properties>,
    SettingsParameter<Settings> {}

interface ResetPropertiesParameter<
  ExtensionUnion extends AnyExtension,
  Settings extends object = {},
  Properties extends object = {}
>
  extends Pick<GetChangedPropertiesParameter<Properties>, 'previous'>,
    GetExtensionParameter<ExtensionUnion>,
    DefaultPropertiesParameter<Properties>,
    Pick<GetChangedPropertiesReturn<Properties>, 'changes'>,
    SettingsParameter<Settings> {}

export interface BasePresetFactoryParameter<
  ExtensionUnion extends AnyExtension,
  Settings extends object = {},
  Properties extends object = {}
> {
  /**
   * Create the extensions which will be consumed by the preset.
   */
  createExtensions: (
    parameter: CreateExtensionsParameter<Settings, Properties>,
  ) => ExtensionUnion[];

  /**
   * Called when the properties are to be set.
   */
  onSetProperties: (
    parameter: SetPropertiesParameter<ExtensionUnion, Settings, Properties>,
  ) => void;

  /**
   * Called when resetting the properties for this preset. It allows you to
   * update the properties of the child extensions when reset is called.
   */
  onResetProperties: (
    parameter: ResetPropertiesParameter<ExtensionUnion, Settings, Properties>,
  ) => void;
}
/* eslint-enable @typescript-eslint/explicit-member-accessibility */

export type PresetFactoryParameter<
  ExtensionUnion extends AnyExtension,
  Settings extends object = {},
  Properties extends object = {}
> = BasePresetFactoryParameter<ExtensionUnion, Settings, Properties> &
  IfEmpty<
    Properties,
    Partial<DefaultPropertiesParameter<Properties>>,
    DefaultPropertiesParameter<Properties>
  > &
  IfEmpty<
    Settings,
    Partial<DefaultSettingsParameter<Settings>>,
    DefaultSettingsParameter<Settings>
  >;

interface DefaultSettingsParameter<Settings extends object> {
  /**
   * The default settings to use.
   */
  defaultSettings: FlipPartialAndRequired<Settings>;
}

interface DefaultPropertiesParameter<Properties extends object> {
  /**
   * The default properties to use.
   */
  defaultProperties: Required<Properties>;
}

interface SettingsParameter<Settings extends object> {
  /**
   * The settings this preset was initialized with.
   */
  settings: Readonly<Required<Settings>>;
}

interface PropertiesParameter<Properties extends object> {
  /**
   * The dynamic properties for the instance.
   */
  properties: Readonly<Required<Properties>>;
}
