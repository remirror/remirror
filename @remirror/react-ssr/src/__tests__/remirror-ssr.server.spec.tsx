/**
 * @jest-environment node
 */

import React from 'react';

import { createTestManager, initialJson } from '@test-fixtures/schema-helpers';
import { renderToString } from 'react-dom/server';

import { ExtensionManager, NodeViewPortalContainer } from '@remirror/core';
import { RemirrorSSR } from '..';

let manager: ExtensionManager;

beforeEach(() => {
  manager = createTestManager();
});

test('should render the ssr component', () => {
  manager.init({ getEditorState: () => state, getPortalContainer: () => new NodeViewPortalContainer() });
  const state = manager.createState({ content: initialJson });

  const htmlString = renderToString(
    <RemirrorSSR
      attributes={{
        class: 'remirror',
        contenteditable: 'false',
        suppressContentEditableWarning: true,
      }}
      manager={manager}
      state={state}
    />,
  );
  expect(htmlString).toInclude('Better docs to come soon...');
  expect(htmlString).toMatchSnapshot();
});
