import { ExtensionPriority, Preset } from '@remirror/core';
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
  content?: string;
}

export class CorePreset extends Preset<CorePresetSettings> {
  public readonly name = 'core' as const;

  protected createDefaultSettings() {
    return { content: DocExtension.defaultSettings.content };
  }

  protected createDefaultProperties() {
    return {};
  }

  protected onSetProperties() {
    return;
  }

  public createExtensions = () => {
    return [
      new DocExtension({ content: this.settings.content, priority: ExtensionPriority.Low }),
      new TextExtension({ priority: ExtensionPriority.Low }),
      new ParagraphExtension({ priority: ExtensionPriority.Low }),
    ];
  };
}
