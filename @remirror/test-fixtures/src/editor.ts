import { AnyExtension, AnyPreset, EditorManager, EditorManagerParameter } from '@remirror/core';
import type {} from '@remirror/extension-doc';
import type {} from '@remirror/extension-paragraph';
import { CorePreset } from '@remirror/preset-core';

/**
 * A manager used for testing with the preset core already applied.
 */
export function createBaseManager<
  ExtensionUnion extends AnyExtension,
  PresetUnion extends AnyPreset
>(parameter: Partial<EditorManagerParameter<ExtensionUnion, PresetUnion>> = {}) {
  const { extensions, presets = [] as PresetUnion[], settings } = parameter;
  const corePreset = CorePreset.of();

  return EditorManager.of({
    extensions,
    presets: [...presets, corePreset],
    settings,
  });
}

export * from '@remirror/preset-core';
export * from '@remirror/extension-doc';
export * from '@remirror/extension-text';
export * from '@remirror/extension-paragraph';
