import {
  DefaultPresetOptions,
  ExtensionPriority,
  OnSetOptionsParameter,
  Preset,
} from '@remirror/core';
import { BaseKeymapExtension, BaseKeymapOptions } from '@remirror/extension-base-keymap';
import { DocExtension, DocOptions } from '@remirror/extension-doc';
import { ParagraphExtension, ParagraphOptions } from '@remirror/extension-paragraph';
import { TextExtension } from '@remirror/extension-text';

/**
 * The static settings for the core preset.
 */
export interface CorePresetOptions extends BaseKeymapOptions, DocOptions, ParagraphOptions {}

export class CorePreset extends Preset<CorePresetOptions> {
  public static defaultOptions: DefaultPresetOptions<CorePresetOptions> = {
    ...DocExtension.defaultOptions,
    ...BaseKeymapExtension.defaultOptions,
    ...ParagraphExtension.defaultOptions,
  };

  get name() {
    return 'core' as const;
  }

  /**
   * No properties are defined so this can be ignored.
   */
  protected onSetOptions(parameter: OnSetOptionsParameter<CorePresetOptions>) {
    const { pickChanged } = parameter;

    const baseKeymapExtension = this.getExtension(BaseKeymapExtension);
    baseKeymapExtension.setOptions(
      pickChanged([
        'defaultBindingMethod',
        'selectParentNodeOnEscape',
        'excludeBaseKeymap',
        'undoInputRuleOnBackspace',
      ]),
    );

    const paragraphExtension = this.getExtension(ParagraphExtension);
    paragraphExtension.setOptions(pickChanged(['indentAttribute', 'indentLevels']));
  }

  public createExtensions() {
    const { content, ...baseKeymapSettings } = this.options;

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
