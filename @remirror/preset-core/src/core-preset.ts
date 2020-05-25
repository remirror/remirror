import {
  DefaultPresetOptions,
  ExtensionPriority,
  OnSetOptionsParameter,
  Preset,
  StaticShape,
} from '@remirror/core';
import {
  BaseKeymapExtension,
  BaseKeymapOptions,
  BaseKeymapProperties,
} from '@remirror/extension-base-keymap';
import { DocExtension, DocOptions } from '@remirror/extension-doc';
import { ParagraphExtension } from '@remirror/extension-paragraph';
import { TextExtension } from '@remirror/extension-text';

/**
 * The static settings for the core preset.
 */
export interface CorePresetOptions extends StaticShape<BaseKeymapOptions & DocOptions> {}

export interface CorePresetOptions extends BaseKeymapProperties {}

export class CorePreset extends Preset<CorePresetOptions> {
  public static defaultOptions: DefaultPresetOptions<CorePresetOptions> = {
    content: DocExtension.defaultOptions.content,
    ...BaseKeymapExtension.defaultOptions,
    keymap: BaseKeymapExtension.defaultProperties.keymap,
  };

  get name() {
    return 'core' as const;
  }

  /**
   * No properties are defined so this can be ignored.
   */
  protected onSetOptions(parameter: OnSetOptionsParameter<CorePresetOptions>) {
    const { changes } = parameter;

    if (changes.keymap.changed) {
      const baseKeymapExtension = this.getExtension(BaseKeymapExtension);
      baseKeymapExtension.setOptions({ keymap: changes.keymap.value });
    }
  }

  public createExtensions() {
    const { content, ...baseKeymapSettings } = this.options;
    const { keymap } = this.options;

    return [
      new DocExtension({ content, priority: ExtensionPriority.Low }),
      new TextExtension({ priority: ExtensionPriority.Low }),
      new ParagraphExtension({ priority: ExtensionPriority.Low }),
      new BaseKeymapExtension({
        ...baseKeymapSettings,
        priority: ExtensionPriority.Low,
      }),
    ];
  }
}
