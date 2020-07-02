import {
  AddCustomHandler,
  CustomHandlerKeyList,
  DefaultPresetOptions,
  ExtensionPriority,
  OnSetOptionsParameter,
  Preset,
} from '@remirror/core';
import { BaseKeymapExtension, BaseKeymapOptions } from '@remirror/extension-base-keymap';
import { DocExtension, DocOptions } from '@remirror/extension-doc';
import { HistoryExtension, HistoryOptions } from '@remirror/extension-history';
import { ParagraphExtension, ParagraphOptions } from '@remirror/extension-paragraph';
import { PositionerExtension, PositionerOptions } from '@remirror/extension-positioner';
import { TextExtension } from '@remirror/extension-text';

/**
 * The static settings for the core preset.
 */
export interface CorePresetOptions
  extends BaseKeymapOptions,
    DocOptions,
    ParagraphOptions,
    PositionerOptions,
    HistoryOptions {}

export class CorePreset extends Preset<CorePresetOptions> {
  static defaultOptions: DefaultPresetOptions<CorePresetOptions> = {
    ...DocExtension.defaultOptions,
    ...BaseKeymapExtension.defaultOptions,
    ...ParagraphExtension.defaultOptions,
    ...HistoryExtension.defaultOptions,
  };

  static customHandlerKeys: CustomHandlerKeyList<CorePresetOptions> = [
    'keymap',
    'positionerHandler',
  ];

  get name() {
    return 'core' as const;
  }

  /**
   * No properties are defined so this can be ignored.
   */
  protected onSetOptions(parameter: OnSetOptionsParameter<CorePresetOptions>) {
    const { pickChanged } = parameter;

    this.getExtension(BaseKeymapExtension).setOptions(
      pickChanged([
        'defaultBindingMethod',
        'selectParentNodeOnEscape',
        'excludeBaseKeymap',
        'undoInputRuleOnBackspace',
      ]),
    );

    this.getExtension(ParagraphExtension).setOptions(
      pickChanged(['indentAttribute', 'indentLevels']),
    );
  }

  protected onAddCustomHandler: AddCustomHandler<CorePresetOptions> = (parameter) => {
    const { keymap, positionerHandler } = parameter;

    if (keymap) {
      return this.getExtension(BaseKeymapExtension).addCustomHandler('keymap', keymap);
    }

    if (positionerHandler) {
      return this.getExtension(PositionerExtension).addCustomHandler(
        'positionerHandler',
        positionerHandler,
      );
    }

    return;
  };

  createExtensions() {
    const {
      content,
      defaultBindingMethod,
      excludeBaseKeymap,
      indentAttribute,
      indentLevels,
      selectParentNodeOnEscape,
      undoInputRuleOnBackspace,
      depth,
      getDispatch,
      getState,
      newGroupDelay,
    } = this.options;

    return [
      new HistoryExtension({ depth, getDispatch, getState, newGroupDelay }),
      new DocExtension({ content }),
      new TextExtension(),
      new ParagraphExtension({ indentAttribute, indentLevels }),
      new PositionerExtension(),
      new BaseKeymapExtension({
        defaultBindingMethod,
        excludeBaseKeymap,
        selectParentNodeOnEscape,
        undoInputRuleOnBackspace,
        priority: ExtensionPriority.Low,
      }),
    ];
  }
}
