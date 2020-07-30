import {
  AddCustomHandler,
  ExtensionPriority,
  OnSetOptionsParameter,
  Preset,
  presetDecorator,
  Static,
} from '@remirror/core';
import { BaseKeymapExtension, BaseKeymapOptions } from '@remirror/extension-base-keymap';
import { DocExtension, DocOptions } from '@remirror/extension-doc';
import { EventsExtension } from '@remirror/extension-events';
import { GapCursorExtension } from '@remirror/extension-gap-cursor';
import { HistoryExtension, HistoryOptions } from '@remirror/extension-history';
import { ParagraphExtension } from '@remirror/extension-paragraph';
import { PositionerExtension, PositionerOptions } from '@remirror/extension-positioner';
import { TextExtension } from '@remirror/extension-text';

/**
 * The options for the core preset.
 */
export interface CorePresetOptions
  extends BaseKeymapOptions,
    DocOptions,
    PositionerOptions,
    HistoryOptions {
  /**
   * When using the `yjs` extension it is important to exclude the history
   * extension to prevent issues with collaborative editing mode.
   *
   * @defaultValue `false`
   */
  excludeHistory?: Static<boolean>;
}

/**
 * The core preset is included by default in framework code like `remirror/react`.
 *
 * It comes with the the following extensions.
 *
 * - `HistoryExtension` - for undo and redo functionality
 * - `DocExtension` - provides the top level prosemirror node.
 * - `TextExtension` - provides the prosemirror text node
 * - `ParagraphExtension` - provides the prosemirror paragraph node
 * - `PositionerExtension` - allows for creating  the extension.
 */
@presetDecorator<CorePresetOptions>({
  defaultOptions: {
    ...DocExtension.defaultOptions,
    ...BaseKeymapExtension.defaultOptions,
    ...ParagraphExtension.defaultOptions,
    ...HistoryExtension.defaultOptions,
    excludeHistory: false,
  },
  customHandlerKeys: ['keymap', 'positionerHandler'],
  handlerKeys: ['onRedo', 'onUndo'],
  staticKeys: ['content', 'depth', 'newGroupDelay', 'excludeHistory'],
})
export class CorePreset extends Preset<CorePresetOptions> {
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
      selectParentNodeOnEscape,
      undoInputRuleOnBackspace,
      depth,
      getDispatch,
      getState,
      newGroupDelay,
    } = this.options;

    const eventsExtension = new EventsExtension();
    const gapCursorExtension = new GapCursorExtension();
    const docExtension = new DocExtension({ content });
    const textExtension = new TextExtension();
    const paragraphExtension = new ParagraphExtension();
    const positionerExtension = new PositionerExtension();
    const baseKeymapExtension = new BaseKeymapExtension({
      defaultBindingMethod,
      excludeBaseKeymap,
      selectParentNodeOnEscape,
      undoInputRuleOnBackspace,
      priority: ExtensionPriority.Low,
    });

    const withHistoryExtension: HistoryExtension[] = [];

    if (!this.options.excludeHistory) {
      const historyExtension = new HistoryExtension({
        depth,
        getDispatch,
        getState,
        newGroupDelay,
      });
      historyExtension.addHandler('onRedo', this.options.onRedo);
      historyExtension.addHandler('onUndo', this.options.onUndo);

      withHistoryExtension.push(historyExtension);
    }

    return [
      ...withHistoryExtension,
      docExtension,
      textExtension,
      paragraphExtension,
      positionerExtension,
      baseKeymapExtension,
      gapCursorExtension,
      eventsExtension,
    ];
  }
}
