import { EditorManager, AnyExtension, AnyPreset, EditorManagerParameter } from '@remirror/core';
import { CorePreset } from '@remirror/preset-core';
import type {} from '@remirror/extension-paragraph';
import type {} from '@remirror/extension-doc';
/**
 * A manager used for testing with the preset core already applied.
 */
export function createBaseManager<
  ExtensionUnion extends AnyExtension,
  PresetUnion extends AnyPreset
>(parameter: Partial<EditorManagerParameter<ExtensionUnion, PresetUnion>>) {
  const { extensions, presets = [], settings } = parameter;
  const corePreset = CorePreset.of();

  return EditorManager.of<ExtensionUnion, PresetUnion | typeof corePreset>({
    extensions,
    presets: [...presets, corePreset],
    settings,
  });
}
