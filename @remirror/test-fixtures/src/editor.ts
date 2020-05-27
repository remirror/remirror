import { AnyExtension, AnyPreset, EditorManager, EditorManagerParameter } from '@remirror/core';
import type {} from '@remirror/extension-doc';
import type {} from '@remirror/extension-paragraph';
import { CorePreset } from '@remirror/preset-core';
import { ReactPreset } from '@remirror/preset-react';

/**
 * A manager used for testing with the preset core already applied.
 */
export function createBaseManager<
  ExtensionUnion extends AnyExtension,
  PresetUnion extends AnyPreset
>(parameter: Partial<EditorManagerParameter<ExtensionUnion, PresetUnion>> = {}) {
  const { extensions = [], presets = [], settings } = parameter;
  const corePreset = new CorePreset();

  return EditorManager.create({
    extensions,
    presets: [...presets, corePreset],
    settings,
  });
}

/**
 * A manager for use to test `@remirror/react`.
 */
export function createReactManager<
  ExtensionUnion extends AnyExtension,
  PresetUnion extends AnyPreset
>(parameter: Partial<EditorManagerParameter<ExtensionUnion, PresetUnion>> = {}) {
  const { extensions = [], presets = [], settings } = parameter;
  const corePreset = new CorePreset();
  const reactPreset = new ReactPreset();

  return EditorManager.create({
    extensions,
    presets: [...presets, corePreset, reactPreset],
    settings,
  });
}

export * from '@remirror/preset-core';
export * from '@remirror/extension-doc';
export * from '@remirror/extension-text';
export * from '@remirror/extension-paragraph';
export * from '@remirror/extension-bold';
