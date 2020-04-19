import { ExtensionPriority, PresetFactory } from '@remirror/core';
import { DocExtension } from '@remirror/extension-doc';
import { ParagraphExtension } from '@remirror/extension-paragraph';
import { TextExtension } from '@remirror/extension-text';

/**
 * The static settings for the core preset.
 */
export interface CorePresetSettings {
  /**
   * The content type accepted by the top level `DocumentExtension`.
   */
  content?: string | null;
}

export const CorePreset = PresetFactory.typed<CorePresetSettings>().preset({
  name: 'core',
  defaultSettings: {
    content: null,
  },

  createExtensions(parameter) {
    const { settings } = parameter;

    return [
      DocExtension.of({ content: settings.content, priority: ExtensionPriority.Low }),
      TextExtension.of({ priority: ExtensionPriority.Low }),
      ParagraphExtension.of({ priority: ExtensionPriority.Low }),
    ];
  },
});
