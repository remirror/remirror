import {
  DefaultPresetSettings,
  ExtensionPriority,
  Preset,
  SetPresetPropertiesParameter,
} from '@remirror/core';
import {
  BaseKeymapExtension,
  BaseKeymapProperties,
  BaseKeymapSettings,
} from '@remirror/extension-base-keymap';
import { DocExtension } from '@remirror/extension-doc';
import { ParagraphExtension } from '@remirror/extension-paragraph';
import { TextExtension } from '@remirror/extension-text';

/**
 * The static settings for the core preset.
 */
export interface CorePresetSettings extends BaseKeymapSettings {
  /**
   * The content type accepted by the top level `DocumentExtension`.
   */
  content?: string;
}

export interface CorePresetProperties extends BaseKeymapProperties {}

export class CorePreset extends Preset<CorePresetSettings, CorePresetProperties> {
  public static defaultSettings: DefaultPresetSettings<CorePresetSettings> = {
    content: DocExtension.defaultSettings.content,
    ...BaseKeymapExtension.defaultSettings,
  };
  public static defaultProperties: Required<CorePresetProperties> = {
    keymap: BaseKeymapExtension.defaultProperties.keymap,
  };

  get name() {
    return 'core' as const;
  }

  /**
   * No properties are defined so this can be ignored.
   */
  protected onSetProperties(parameter: SetPresetPropertiesParameter<CorePresetProperties>) {
    const { changes } = parameter;

    if (changes.keymap.changed) {
      const baseKeymapExtension = this.getExtension(BaseKeymapExtension);
      baseKeymapExtension.setProperties({ keymap: changes.keymap.value });
    }
  }

  protected createExtensions() {
    const { content, ...baseKeymapSettings } = this.settings;
    const { keymap } = this.properties;

    return [
      new DocExtension({ content, priority: ExtensionPriority.Low }),
      new TextExtension({ priority: ExtensionPriority.Low }),
      new ParagraphExtension({ priority: ExtensionPriority.Low }),
      new BaseKeymapExtension({
        ...baseKeymapSettings,
        properties: { keymap },
        priority: ExtensionPriority.Low,
      }),
    ];
  }
}
