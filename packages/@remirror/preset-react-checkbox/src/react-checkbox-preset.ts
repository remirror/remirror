import {
  CustomHandlerKeyList,
  DefaultPresetOptions,
  HandlerKeyList,
  OnSetOptionsParameter,
  Preset,
  StaticKeyList,
} from '@remirror/core';

export interface CheckboxOptions {}

export class CheckboxPreset extends Preset<CheckboxOptions> {
  static readonly staticKeys: StaticKeyList<CheckboxOptions> = [];
  static readonly handlerKeys: HandlerKeyList<CheckboxOptions> = [];
  static readonly customHandlerKeys: CustomHandlerKeyList<CheckboxOptions> = [];
  static readonly defaultOptions: DefaultPresetOptions<CheckboxOptions> = {};

  get name() {
    return 'reactCheckbox' as const;
  }

  protected onSetOptions(_: OnSetOptionsParameter<CheckboxOptions>) {}

  createExtensions() {
    return [];
  }
}
