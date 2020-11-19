import { OnSetOptionsParameter, Preset, presetDecorator } from '@remirror/core';

import { IframeExtension, IframeOptions } from './iframe-extension';

export interface EmbedOptions extends IframeOptions {}

@presetDecorator<EmbedOptions>({
  defaultOptions: IframeExtension.defaultOptions,
  staticKeys: ['class', 'defaultSource'],
})
export class EmbedPreset extends Preset<EmbedOptions> {
  get name() {
    return 'embed' as const;
  }

  protected onSetOptions(_parameter: OnSetOptionsParameter<EmbedOptions>): void {}

  createExtensions() {
    const { defaultSource } = this.options;

    return [new IframeExtension({ defaultSource })];
  }
}
