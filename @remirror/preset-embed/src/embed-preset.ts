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
  public static readonly staticKeys: StaticKeyList<TemplateOptions> = [];
  public static readonly handlerKeys: HandlerKeyList<TemplateOptions> = [];
  public static readonly customHandlerKeys: CustomHandlerKeyList<TemplateOptions> = [];

  public static readonly defaultOptions: DefaultPresetOptions<TemplateOptions> = {
    ...IframeExtension.defaultOptions,
  };

  get name() {
    return 'embed' as const;
  }

  protected onSetOptions(_parameter: OnSetOptionsParameter<TemplateOptions>) {}

  public createExtensions() {
    const { defaultSource } = this.options;

    return [new IframeExtension({ defaultSource })];
  }
}
