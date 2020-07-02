import React from 'react';
import { renderToString } from 'react-dom/server';

import { AnyCombinedUnion, object } from 'remirror/core';
import { createReactManager, CreateReactManagerOptions, RemirrorProvider } from 'remirror/react';

import { RenderEditorParameter } from './jest-remirror-types';

interface RenderEditorStringOptions<Combined extends AnyCombinedUnion>
  extends Omit<RenderEditorParameter<Combined>, 'autoClean'>,
    CreateReactManagerOptions {}

/**
 * Render the editor with the params passed in. Useful for testing.
 */
export function renderEditorString<Combined extends AnyCombinedUnion>(
  combined: Combined[],
  { props, ...rest }: RenderEditorStringOptions<Combined> = object(),
): string {
  const manager = createReactManager([...combined], rest);

  return renderToString(
    <RemirrorProvider {...props} manager={manager}>
      <div />
    </RemirrorProvider>,
  );
}
