import {
  CustomHandlerKeyList,
  DefaultPresetOptions,
  HandlerKeyList,
  OnSetOptionsParameter,
  Preset,
  StaticKeyList,
} from '@remirror/core';

import { IframeExtension, IframeOptions } from './iframe-extension';

export interface EmbedOptions extends IframeOptions {}

export class EmbedPreset extends Preset<EmbedOptions> {
  static readonly staticKeys: StaticKeyList<EmbedOptions> = [];
  static readonly handlerKeys: HandlerKeyList<EmbedOptions> = [];
  static readonly customHandlerKeys: CustomHandlerKeyList<EmbedOptions> = [];

  static readonly defaultOptions: DefaultPresetOptions<EmbedOptions> = {
    ...IframeExtension.defaultOptions,
  };

  get name() {
    return 'embed' as const;
  }

  protected onSetOptions(_parameter: OnSetOptionsParameter<EmbedOptions>) {}

  createExtensions() {
    const { defaultSource } = this.options;

    return [new IframeExtension({ defaultSource })];
  }
}
