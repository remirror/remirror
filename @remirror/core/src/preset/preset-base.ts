/* eslint-disable @typescript-eslint/explicit-member-accessibility */
import {
  ErrorConstant,
  REMIRROR_IDENTIFIER_KEY,
  RemirrorIdentifier,
} from '@remirror/core-constants';
import { deepMerge, invariant, object, uniqueBy } from '@remirror/core-helpers';
import { FlipPartialAndRequired, IfEmpty, IfNoRequiredProperties } from '@remirror/core-types';

import { AnyExtension, AnyExtensionConstructor, DefaultSettingsType } from '../extension';
import { ExtensionFromConstructor, GetConstructor } from '../extension/extension-types';

/**
 * A preset is our way of bundling similar extensions with unified
 * settings and dynamic properties.
 */
export abstract class Preset<
  ExtensionUnion extends AnyExtension,
  Settings extends object = {},
  Properties extends object = {}
> {
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
  #properties: Required<Properties>;

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
  public setProperties(properties: Partial<Properties>) {
    this.parameter.onSetProperties({
      properties,
      settings: this.settings,
      getExtension: (Constructor) => {
        const extension = this.#extensionMap.get(Constructor);

        invariant(extension, { code: ErrorConstant.INVALID_PRESET_EXTENSION });

        return extension as ExtensionFromConstructor<typeof Constructor>;
      },
    });
  }
}

interface CreateExtensionsParameter<Settings extends object = {}, Properties extends object = {}> {
  settings: Required<Settings>;
  properties: Required<Properties>;
}

interface SetPropertiesParameter<
  ExtensionUnion extends AnyExtension,
  Settings extends object = {},
  Properties extends object = {}
> {
  settings: Readonly<Required<Settings>>;
  properties: Readonly<Partial<Properties>>;

  /**
   * Get extension from the preset that corresponds to the provided `Constructor`.
   *
   * @param Constructor - the extension constructor to find in the editor.
   */
  getExtension: <ExtensionConstructor extends GetConstructor<ExtensionUnion>>(
    Constructor: ExtensionConstructor,
  ) => ExtensionFromConstructor<ExtensionConstructor>;
}

interface DefaultSettings<Settings extends object> {
  /**
   * The default settings to use.
   */
  defaultSettings: FlipPartialAndRequired<Settings>;
}

interface DefaultProperties<Properties extends object> {
  /**
   * The default properties to use.
   */
  defaultProperties: Required<Properties>;
}

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
   *
   * @remarks
   *
   * It provides a getExtension method which
   */
  onSetProperties: (
    parameter: SetPropertiesParameter<ExtensionUnion, Settings, Properties>,
  ) => void;
}
/* eslint-enable @typescript-eslint/explicit-member-accessibility */

export type PresetFactoryParameter<
  ExtensionUnion extends AnyExtension,
  Settings extends object = {},
  Properties extends object = {}
> = BasePresetFactoryParameter<ExtensionUnion, Settings, Properties> &
  IfEmpty<Properties, Partial<DefaultProperties<Properties>>, DefaultProperties<Properties>> &
  IfEmpty<Settings, Partial<DefaultSettings<Settings>>, DefaultSettings<Settings>>;
