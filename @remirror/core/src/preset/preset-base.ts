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
import {
  AnyFunction,
  FlipPartialAndRequired,
  FunctionLike,
  IfEmpty,
  IfNoRequiredProperties,
} from '@remirror/core-types';

import {
  AnyExtension,
  AnyExtensionConstructor,
  DefaultSettingsType,
  ExtensionListParameter,
  GetExtensionParameter,
} from '../extension';
import { getChangedProperties, GetChangedPropertiesReturn } from '../helpers';
import {
  DefaultPropertiesParameter,
  GetConstructor,
  Of,
  PropertiesShape,
  PropertiesUpdateReason,
  PropertiesUpdateReasonParameter,
  ReadonlyPropertiesParameter,
  ReadonlySettingsParameter,
} from '../types';

/**
 * The type which is applicable to any `Preset` instances.
 */
export type AnyPreset<ExtensionUnion extends AnyExtension = any> = Omit<
  Preset<ExtensionUnion, {}, {}>,
  'parameter'
> & {
  parameter: Omit<
    BasePresetFactoryParameter<ExtensionUnion, {}, {}>,
    'createExtensions' | 'onSetProperties' | 'onResetProperties'
  > & {
    createExtensions: (...args: any[]) => ExtensionUnion[];
    onSetProperties?: (...args: any[]) => void;
    onResetProperties?: (...args: any[]) => void;
  };
};

export interface AnyPresetConstructor extends FunctionLike {
  /**
   * The name of the extension that will be created. Also available on the
   * instance as `name`.
   */
  readonly presetName: string;

  defaultSettings: any;
  defaultProperties: any;

  /**
   * Creates a new instance of the extension. Used when adding the extension to
   * the editor.
   */
  of: AnyFunction;
}

/**
 * The interface of a preset constructor. This is used to create an instance of
 * the preset in your editor.
 */
export interface PresetConstructor<
  ExtensionUnion extends AnyExtension,
  Settings extends object,
  Properties extends object
> extends FunctionLike {
  readonly presetName: string;
  defaultSettings: Settings;
  defaultProperties: Properties;

  /**
   * Create a new instance of the preset to be used in the extension manager.
   *
   * This is used to prevent the need for the `new` keyword which can lead to
   * problems.
   */
  of: (
    ...settings: IfNoRequiredProperties<Settings, [Settings?], [Settings]>
  ) => Preset<ExtensionUnion, Settings, Properties>;
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
 * A preset is our way of bundling similar extensions with unified
 * settings and dynamic properties.
 */
export abstract class Preset<
  ExtensionUnion extends AnyExtension,
  Settings extends object,
  Properties extends object
>
  implements
    ExtensionListParameter<ExtensionUnion>,
    PropertiesShape<Properties>,
    GetExtensionParameter<ExtensionUnion> {
  /**
   * Not for public usage. This is purely for types to make it easier to infer
   * the type of `Settings` on an extension instance.
   */
  public readonly ['~S']!: Settings;

  /**
   * Not for public usage. This is purely for types to make it easier to infer
   * the type of `Settings` on an extension instance.
   */
  public readonly ['~P']!: Properties;

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

  /**
   * Keep track of whether this extension has been initialized or not.
   */
  #hasInitialized = false;

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
        settings: this.#settings,
        properties: this.#properties,
      }),
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

  protected abstract getFactoryParameter(): Readonly<
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
    const reason: PropertiesUpdateReason = this.#hasInitialized ? 'set' : 'init';
    const previousProperties = this.#properties;
    const { changes, properties } = getChangedProperties({
      previousProperties,
      update,
    });

    // Trigger the update handler so that child extension properties can also be
    // updated.
    this.parameter.onSetProperties?.({
      reason,
      changes,
      properties,
      defaultProperties: this.defaultProperties,
      settings: this.settings,
      getExtension: this.getExtension,
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
      update: this.defaultProperties,
    });

    // Trigger the update handler so that child extension properties can also be
    // updated.
    this.parameter.onSetProperties?.({
      reason: 'reset',
      properties,
      changes,
      defaultProperties: this.defaultProperties,
      settings: this.settings,
      getExtension: this.getExtension,
    });

    // Update the stored properties value.
    this.#properties = properties;
  }

  public getExtension = <ExtensionConstructor extends GetConstructor<ExtensionUnion>>(
    Constructor: ExtensionConstructor,
  ): Of<ExtensionConstructor> => {
    const extension = this.#extensionMap.get(Constructor);

    // Throws an error if attempting to get an extension which is not preset
    // in this preset.
    invariant(extension, { code: ErrorConstant.INVALID_PRESET_EXTENSION });

    return extension as Of<typeof Constructor>;
  };
}

export interface Preset<
  ExtensionUnion extends AnyExtension,
  Settings extends object,
  Properties extends object
> {
  /**
   * The typed constructor for the `Preset` instance.
   */
  constructor: PresetConstructor<ExtensionUnion, Settings, Properties>;
}

interface CreateExtensionsParameter<Settings extends object, Properties extends object>
  extends ReadonlyPropertiesParameter<Properties>,
    ReadonlySettingsParameter<Settings> {}

interface SetPresetPropertiesParameter<
  ExtensionUnion extends AnyExtension,
  Settings extends object,
  Properties extends object
>
  extends GetExtensionParameter<ExtensionUnion>,
    DefaultPropertiesParameter<Properties>,
    GetChangedPropertiesReturn<Properties>,
    ReadonlySettingsParameter<Settings>,
    PropertiesUpdateReasonParameter {}

export interface BasePresetFactoryParameter<
  ExtensionUnion extends AnyExtension,
  Settings extends object,
  Properties extends object
> {
  /**
   * The `camelCased` name of the preset.
   */
  name: string;

  /**
   * Create the extensions which will be consumed by the preset.
   */
  createExtensions: (
    parameter: CreateExtensionsParameter<Settings, Properties>,
  ) => ExtensionUnion[];

  /**
   * Called every time properties for this extension are set or reset. This is
   * also called when the extension is first created with the default properties.
   */
  onSetProperties?: (
    parameter: SetPresetPropertiesParameter<ExtensionUnion, Settings, Properties>,
  ) => void;
}
/* eslint-enable @typescript-eslint/explicit-member-accessibility */

export type PresetFactoryParameter<
  ExtensionUnion extends AnyExtension,
  Settings extends object,
  Properties extends object
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
