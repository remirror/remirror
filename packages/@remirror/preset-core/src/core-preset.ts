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
   * You can exclude one or multiple extensions from CorePreset by passing their
   * extension names in `excludeExtensions`.
   *
   * When using the `yjs` extension it is important to exclude the history
   * extension to prevent issues with collaborative editing mode.
   *
   * @defaultValue `[]`
   */
  excludeExtensions?: Static<
    Array<
      | 'doc'
      | 'paragraph'
      | 'text'
      | 'positioner'
      | 'history'
      | 'gapCursor'
      | 'baseKeymap'
      | 'events'
    >
  >;
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
    excludeExtensions: [],
  },
  customHandlerKeys: ['keymap', 'positionerHandler'],
  handlerKeys: ['onRedo', 'onUndo'],
  staticKeys: ['content', 'depth', 'newGroupDelay', 'excludeExtensions'],
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
      excludeExtensions,
    } = this.options;

    type ExcludeExtensionKey = typeof excludeExtensions[number];
    const excludeMap: Partial<Record<ExcludeExtensionKey, boolean>> = {};

    for (const name of excludeExtensions || []) {
      excludeMap[name] = true;
    }

    type CoreExtension =
      | HistoryExtension
      | GapCursorExtension
      | DocExtension
      | TextExtension
      | ParagraphExtension
      | PositionerExtension
      | EventsExtension
      | BaseKeymapExtension;

    const coreExtensions: CoreExtension[] = [];

    if (!excludeMap['history']) {
      const historyExtension = new HistoryExtension({
        depth,
        getDispatch,
        getState,
        newGroupDelay,
      });
      historyExtension.addHandler('onRedo', this.options.onRedo);
      historyExtension.addHandler('onUndo', this.options.onUndo);
      coreExtensions.push(historyExtension);
    }

    if (!excludeMap['doc']) {
      coreExtensions.push(new DocExtension({ content }));
    }

    if (!excludeMap['text']) {
      coreExtensions.push(new TextExtension());
    }

    if (!excludeMap['paragraph']) {
      coreExtensions.push(new ParagraphExtension());
    }

    if (!excludeMap['positioner']) {
      coreExtensions.push(new PositionerExtension());
    }

    if (!excludeMap['baseKeymap']) {
      coreExtensions.push(
        new BaseKeymapExtension({
          defaultBindingMethod,
          excludeBaseKeymap,
          selectParentNodeOnEscape,
          undoInputRuleOnBackspace,
          priority: ExtensionPriority.Low,
        }),
      );
    }

    if (!excludeMap['gapCursor']) {
      coreExtensions.push(new GapCursorExtension());
    }

    if (!excludeMap['events']) {
      coreExtensions.push(new EventsExtension());
    }

    return coreExtensions;
  }
}
