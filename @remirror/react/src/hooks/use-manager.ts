import { AnyExtension, AnyPreset, EditorManager, ManagerSettings } from '@remirror/core';

/**
 * Create a manager which can be passed into the editor.
 */
export const useManager = <
  ExtensionUnion extends AnyExtension,
  PresetUnion extends AnyPreset<ExtensionUnion>
>(
  extensionOrPresetList: Array<ExtensionUnion | PresetUnion>,
  settings: ManagerSettings,
) => {
  // No updates for now.

  return EditorManager.of(extensionOrPresetList, settings);
};
