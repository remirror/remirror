import { OnSetOptionsParameter, Preset, presetDecorator } from '@remirror/core';

export interface TemplateOptions {}

@presetDecorator<TemplateOptions>({})
export class TemplatePreset extends Preset<TemplateOptions> {
  get name() {
    return 'template' as const;
  }

  protected onSetOptions(_: OnSetOptionsParameter<TemplateOptions>) {}

  createExtensions() {
    return [];
  }
}
