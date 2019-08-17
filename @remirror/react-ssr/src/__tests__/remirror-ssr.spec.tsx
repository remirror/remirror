import React from 'react';

import { createTestManager, helpers, initialJson } from '@test-fixtures/schema-helpers';
import { render } from '@test-fixtures/testing-library';

import { ExtensionManager } from '@remirror/core';
import { RemirrorSSR } from '..';

let manager: ExtensionManager;

beforeEach(() => {
  manager = createTestManager();
});

test('should render the ssr component', () => {
  manager.init({ ...helpers, getState: () => state });
  const state = manager.createState({ content: initialJson });

  const { container } = render(
    <RemirrorSSR
      editable={true}
      attributes={{
        class: 'remirror',
      }}
      manager={manager}
      state={state}
    />,
  );
  expect(container).toHaveTextContent('Better docs to come soon...');
});
