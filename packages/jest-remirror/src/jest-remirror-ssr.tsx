import React from 'react';
import { renderToString } from 'react-dom/server';

import { AnyCombinedUnion, object } from 'remirror/core';
import { createReactManager, RemirrorProvider } from 'remirror/react';

import { RenderEditorParameter } from './jest-remirror-types';

/**
 * Render the editor with the params passed in. Useful for testing.
 */
export function renderEditorString<Combined extends AnyCombinedUnion>(
  combined: Combined[],
  { settings, props }: RenderEditorParameter<Combined> = object(),
): string {
  const manager = createReactManager([...combined], settings);

  return renderToString(
    <RemirrorProvider {...props} manager={manager}>
      <div />
    </RemirrorProvider>,
  );
}
