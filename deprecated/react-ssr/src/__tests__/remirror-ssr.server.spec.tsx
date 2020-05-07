/**
 * @jest-environment node
 */

import React from 'react';
import { renderToString } from 'react-dom/server';

import { EditorManager } from '@remirror/core';
import { createTestManager, helpers, initialJson } from '@remirror/test-fixtures';

import { RemirrorSSR } from '..';

let manager: EditorManager;

beforeEach(() => {
  manager = createTestManager();
});

test('should render the ssr component', () => {
  manager.initialize({ ...helpers, getState: () => state });
  const state = manager.createState({ content: initialJson });

  const htmlString = renderToString(
    <RemirrorSSR
      editable={true}
      attributes={{
        class: 'remirror',
      }}
      manager={manager}
      state={state}
    />,
  );

  expect(htmlString).toMatchSnapshot();
});
