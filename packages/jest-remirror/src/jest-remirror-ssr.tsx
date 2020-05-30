import React from 'react';
import { renderToString } from 'react-dom/server';

import { AnyCombinedUnion, EditorManager, object } from 'remirror/core';
import { CorePreset } from 'remirror/preset/core';
import { RenderEditor } from 'remirror/react';

import { RenderEditorParameter } from './jest-remirror-types';

/**
 * Render the editor with the params passed in. Useful for testing.
 */
export function renderEditorString<Combined extends AnyCombinedUnion>(
  combined: Combined[],
  { settings, props }: RenderEditorParameter<Combined> = object(),
): string {
  const corePreset = new CorePreset();

  const manager = EditorManager.fromList([...combined, corePreset], settings);

  return renderToString(
    <RenderEditor {...props} manager={manager}>
      {(param) => {
        if (props?.children) {
          return props.children(param);
        }

        return <div />;
      }}
    </RenderEditor>,
  );
}
