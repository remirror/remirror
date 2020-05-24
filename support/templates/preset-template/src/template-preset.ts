import { Preset, SetOptionsParameter } from '@remirror/core';

export interface TemplatePresetOptions {}

export class TemplatePreset extends Preset<TemplatePresetOptions> {
  get name() {
    return 'template' as const;
  }

  /**
   * Use this to define how the
   */
  protected onSetOptions(_: SetOptionsParameter<TemplatePresetOptions>) {}

  public createExtensions() {
    return [];
  }
}
