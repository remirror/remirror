import {
  CustomHandlerKeyList,
  DefaultPresetOptions,
  HandlerKeyList,
  OnSetOptionsParameter,
  Preset,
  StaticKeyList,
} from '@remirror/core';

export interface TemplateOptions {}

export class TemplatePreset extends Preset<TemplateOptions> {
  static readonly staticKeys: StaticKeyList<TemplateOptions> = [];
  static readonly handlerKeys: HandlerKeyList<TemplateOptions> = [];
  static readonly customHandlerKeys: CustomHandlerKeyList<TemplateOptions> = [];

  static readonly defaultOptions: DefaultPresetOptions<TemplateOptions> = {};
  get name() {
    return 'template' as const;
  }

  protected onSetOptions(_: OnSetOptionsParameter<TemplateOptions>) {}

  createExtensions() {
    return [];
  }
}
