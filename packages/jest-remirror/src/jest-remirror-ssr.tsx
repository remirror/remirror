import React from 'react';
import { renderToString } from 'react-dom/server';

import { AnyExtension, AnyPreset, EditorManager, object } from '@remirror/core';
import { RenderEditor, RenderEditorProps } from '@remirror/react';

/**
 * Render the editor with the params passed in. Useful for testing.
 */
export function renderEditorString<
  ExtensionUnion extends AnyExtension,
  PresetUnion extends AnyPreset
>(
  extensionOrPresetList: Array<ExtensionUnion | PresetUnion>,
  properties: Partial<
    Omit<RenderEditorProps<EditorManager<ExtensionUnion, PresetUnion>>, 'manager'>
  > = object(),
): string {
  const manager = EditorManager.of<ExtensionUnion, PresetUnion>(extensionOrPresetList);

  return renderToString(
    <RenderEditor {...properties} manager={manager}>
      {(parameter) => {
        if (properties.children) {
          return properties.children(parameter);
        }

        return <div />;
      }}
    </RenderEditor>,
  );
}
