import {
  AnyExtension,
  BuiltinPreset,
  getLazyArray,
  GetStaticAndDynamic,
  RemirrorManager,
  Static,
} from '@remirror/core';
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
export interface CorePresetOptions extends DocOptions, PositionerOptions, HistoryOptions {
  /**
   * You can exclude one or multiple extensions from the [[`corePreset`]]
   * function by passing their extension names in `excludeExtensions`.
   *
   * When using the `yjs` extension it is important to exclude the history
   * extension to prevent issues with collaborative editing mode.
   *
   * @default []
   */
  excludeExtensions?: Static<ExcludeExtensionKey[]>;
}

type ExcludeExtensionKey = CorePreset['name'];

const defaultOptions = {
  ...DocExtension.defaultOptions,
  ...ParagraphExtension.defaultOptions,
  ...HistoryExtension.defaultOptions,
  excludeExtensions: [],
};

/**
 * The core preset is included by default in framework code like
 * `remirror/react`.
 *
 * It comes with the the following extensions.
 *
 * - `HistoryExtension` - for undo and redo functionality
 * - `DocExtension` - provides the top level prosemirror node.
 * - `TextExtension` - provides the prosemirror text node
 * - `ParagraphExtension` - provides the prosemirror paragraph node
 * - `PositionerExtension` - set up automatic position checking and creation of
 *   virtual nodes from any part of the editor.
 */
export function corePreset(options: GetStaticAndDynamic<CorePresetOptions> = {}): CorePreset[] {
  options = { ...defaultOptions, ...options };
  const { content, depth, getDispatch, getState, newGroupDelay, excludeExtensions } = options;
  const excludeMap: Partial<Record<ExcludeExtensionKey, boolean>> = {};

  for (const name of excludeExtensions ?? []) {
    excludeMap[name] = true;
  }

  const coreExtensions: CorePreset[] = [];

  if (!excludeMap['history']) {
    const historyExtension = new HistoryExtension({ depth, getDispatch, getState, newGroupDelay });
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

  if (!excludeMap['gapCursor']) {
    coreExtensions.push(new GapCursorExtension());
  }

  if (!excludeMap['events']) {
    coreExtensions.push(new EventsExtension());
  }

  return coreExtensions;
}

export interface CreateCoreManagerOptions extends Remirror.ManagerSettings {
  /**
   * The core preset options.
   */
  core?: GetStaticAndDynamic<CorePresetOptions>;
}

export type CorePreset =
  | HistoryExtension
  | GapCursorExtension
  | DocExtension
  | TextExtension
  | ParagraphExtension
  | PositionerExtension
  | EventsExtension;

/**
 * Create a manager with the core preset already applied.
 */
export function createCoreManager<Extension extends AnyExtension>(
  extensions: Extension[] | (() => Extension[]),
  options: CreateCoreManagerOptions = {},
): RemirrorManager<Extension | CorePreset | BuiltinPreset> {
  const { core, ...managerSettings } = options;

  return RemirrorManager.create(
    () => [...getLazyArray(extensions), ...corePreset(core)],
    managerSettings,
  );
}
