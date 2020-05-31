import {
  CustomKeyList,
  DefaultPresetOptions,
  HandlerKeyList,
  Preset,
  SetOptionsParameter,
  StaticKeyList,
} from '@remirror/core';

export interface TemplateOptions {}

export class TemplatePreset extends Preset<TemplateOptions> {
  public static readonly staticKeys: StaticKeyList<TemplateOptions> = [];
  public static readonly handlerKeys: HandlerKeyList<TemplateOptions> = [];
  public static readonly customHandlerKeys: CustomKeyList<TemplateOptions> = [];

  public static readonly defaultOptions: DefaultPresetOptions<TemplateOptions> = {};
  get name() {
    return 'template' as const;
  }

  protected onSetOptions(_: SetOptionsParameter<TemplateOptions>) {}

  public createExtensions() {
    return [];
  }
}
