import { OnSetOptionsParameter, Preset } from '@remirror/core';
import { ReactSSRExtension, ReactSSROptions } from '@remirror/extension-react-ssr';

export interface ReactPresetOptions extends ReactSSROptions {}

export class ReactPreset extends Preset<ReactPresetOptions> {
  public static defaultOptions: Required<ReactPresetOptions> = {
    ...ReactSSRExtension.defaultOptions,
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

    return [new ReactSSRExtension({ transformers })];
  }
}
