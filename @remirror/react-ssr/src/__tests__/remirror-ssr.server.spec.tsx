/**
 * @jest-environment node
 */

import React from 'react';

import { createTestManager, initialJson } from '@test-fixtures/schema-helpers';
import { renderToString } from 'react-dom/server';

import { ExtensionManager, PortalContainer } from '@remirror/core';
import { RemirrorSSR } from '..';

let manager: ExtensionManager;

beforeEach(() => {
  manager = createTestManager();
});

test('should render the ssr component', () => {
  manager.init({ getState: () => state, portalContainer: new PortalContainer() });
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
  expect(htmlString).toInclude('Better docs to come soon...');
  expect(htmlString).toMatchSnapshot();
});
