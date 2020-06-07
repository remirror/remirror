import {
  CustomHandlerKeyList,
  DefaultPresetOptions,
  HandlerKeyList,
  OnSetOptionsParameter,
  Preset,
  StaticKeyList,
} from '@remirror/core';

import { IframeExtension, IframeOptions } from './iframe-extension';

export interface TemplateOptions extends IframeOptions {}

export class EmbedPreset extends Preset<TemplateOptions> {
  static readonly staticKeys: StaticKeyList<TemplateOptions> = [];
  static readonly handlerKeys: HandlerKeyList<TemplateOptions> = [];
  static readonly customHandlerKeys: CustomHandlerKeyList<TemplateOptions> = [];

  static readonly defaultOptions: DefaultPresetOptions<TemplateOptions> = {
    ...IframeExtension.defaultOptions,
  };

  get name() {
    return 'embed' as const;
  }

  protected onSetOptions(_parameter: OnSetOptionsParameter<TemplateOptions>) {}

  createExtensions() {
    const { defaultSource } = this.options;

    return [new IframeExtension({ defaultSource })];
  }
}
