import { deepMerge, IfNoRequiredProperties } from '..';
import { AnyExtension, defaultSettings } from '../extension/extension-base';

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
   * Private instance of the presets static settings.
   */
  #settings: Required<Settings>;

  /**
   * Private instance of the presets dynamic properties.
   */
  #properties: Required<Properties>;

  get settings() {
    return this.#settings;
  }

  get properties() {
    return this.#properties;
  }

  constructor(...[settings]: IfNoRequiredProperties<Settings, [Settings?], [Settings]>) {
    this.#settings = deepMerge(defaultSettings, {
      ...this.defaultSettings,
      ...settings,
    });

    this.#properties = { ...this.defaultProperties };
  }

  abstract getFactoryParameter(): Readonly<
    PresetFactoryParameter<ExtensionUnion, Settings, Properties>
  >;
}

export interface PresetFactoryParameter<
  ExtensionUnion extends AnyExtension,
  Settings extends object = {},
  Properties extends object = {}
> {}
