import { AnyExtension, AnyPreset, EditorManager, EditorManagerParameter } from '@remirror/core';
import { CorePreset } from '@remirror/preset-core';
import { ReactPreset } from '@remirror/preset-react';

/**
 * A manager used for testing with the preset core already applied.
 *
 * TODO refactor to use combined array as parameter.
 */
export function createBaseManager<
  ExtensionUnion extends AnyExtension,
  PresetUnion extends AnyPreset
>(parameter: Partial<EditorManagerParameter<ExtensionUnion, PresetUnion>> = {}) {
  const { extensions = [], presets = [], settings } = parameter;
  const corePreset = new CorePreset();

  return EditorManager.fromObject({
    extensions,
    presets: [...presets, corePreset],
    settings,
  });
}

/**
 * A manager for use to test `@remirror/react`.
 *
 * TODO refactor to use combined array as parameter.
 */
export function createReactManager<
  ExtensionUnion extends AnyExtension,
  PresetUnion extends AnyPreset
>(parameter: Partial<EditorManagerParameter<ExtensionUnion, PresetUnion>> = {}) {
  const { extensions = [], presets = [], settings } = parameter;
  const corePreset = new CorePreset();
  const reactPreset = new ReactPreset();

  return EditorManager.fromObject({
    extensions,
    presets: [...presets, corePreset, reactPreset],
    settings,
  });
}

export const initialJson = {
  type: 'doc',
  content: [
    { type: 'paragraph', content: [{ type: 'text', text: 'Better docs to come soon...' }] },
  ],
};

export { default as minDocument } from 'min-document';

export * from '@remirror/preset-core';
export * from '@remirror/extension-doc';
export * from '@remirror/extension-text';
export * from '@remirror/extension-paragraph';
export * from '@remirror/extension-bold';
export * from '@remirror/extension-code-block';
export * from '@remirror/extension-heading';
export * from '@remirror/extension-blockquote';
export * from '@remirror/extension-link';
