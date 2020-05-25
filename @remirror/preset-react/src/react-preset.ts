import { OnSetOptionsParameter, Preset } from '@remirror/core';
import { ReactSSRExtension, ReactSSRProperties } from '@remirror/extension-react-ssr';

/**
 * The static settings for the core preset.
 */
export interface ReactPresetOptions {}

export interface ReactPresetOptions extends ReactSSRProperties {}

export class ReactPreset extends Preset<ReactPresetOptions, ReactPresetOptions> {
  public static defaultProperties: Required<ReactPresetOptions> = {
    ...ReactSSRExtension.defaultProperties,
  };

  get name() {
    return 'react' as const;
  }

  /**
   * No properties are defined so this can be ignored.
   */
  protected onSetOptions(parameter: OnSetOptionsParameter<ReactPresetOptions>) {
    const { changes } = parameter;

    if (changes.transformers.changed) {
      const reactSSRExtension = this.getExtension(ReactSSRExtension);
      reactSSRExtension.setOptions({ transformers: changes.transformers.value });
    }
  }

  public createExtensions() {
    const { transformers } = this.options;

    return [new ReactSSRExtension({ properties: { transformers } })];
  }
}
