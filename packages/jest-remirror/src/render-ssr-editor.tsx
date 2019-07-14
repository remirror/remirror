import React from 'react';

import { AnyExtension, ExtensionManager } from '@remirror/core';
import { Remirror, RemirrorProps } from '@remirror/react';
import { renderToString } from 'react-dom/server';
import { nodeExtensions } from './test-schema';

/**
 * Render the editor with the params passed in. Useful for testing.
 */
export const renderSSREditor = (
  extensions: AnyExtension[] = [],
  props: Partial<Omit<RemirrorProps, 'manager'>> = {},
): string => {
  const manager = ExtensionManager.create([...nodeExtensions, ...extensions]);
  return renderToString(
    <Remirror {...props} manager={manager}>
      {params => {
        if (props.children) {
          return props.children(params);
        }
        return <div />;
      }}
    </Remirror>,
  );
};
