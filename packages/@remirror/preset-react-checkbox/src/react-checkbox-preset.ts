import { OnSetOptionsParameter, Preset, presetDecorator } from '@remirror/core';

export interface CheckboxOptions {}

@presetDecorator<CheckboxOptions>({})
export class CheckboxPreset extends Preset<CheckboxOptions> {
  get name() {
    return 'reactCheckbox' as const;
  }

  protected onSetOptions(_: OnSetOptionsParameter<CheckboxOptions>) {}

  createExtensions() {
    return [];
  }
}
