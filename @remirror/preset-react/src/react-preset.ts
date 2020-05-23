import { Preset, SetPresetPropertiesParameter } from '@remirror/core';
import { ReactSSRExtension, ReactSSRProperties } from '@remirror/extension-react-ssr';

/**
 * The static settings for the core preset.
 */
export interface ReactPresetSettings {}

export interface ReactPresetProperties extends ReactSSRProperties {}

export class ReactPreset extends Preset<ReactPresetSettings, ReactPresetProperties> {
  public static defaultProperties: Required<ReactPresetProperties> = {
    ...ReactSSRExtension.defaultProperties,
  };

  public readonly name = 'react' as const;

  /**
   * No properties are defined so this can be ignored.
   */
  protected onSetProperties(parameter: SetPresetPropertiesParameter<ReactPresetProperties>) {
    const { changes } = parameter;

    if (changes.transformers.changed) {
      const reactSSRExtension = this.getExtension(ReactSSRExtension);
      reactSSRExtension.setProperties({ transformers: changes.transformers.value });
    }
  }

  public createExtensions() {
    const { transformers } = this.properties;

    return [new ReactSSRExtension({ properties: { transformers } })];
  }
}
