import React from 'react';

import { createTestManager, initialJson } from '@test-fixtures/schema-helpers';
import { render } from '@testing-library/react';

import { ExtensionManager, NodeViewPortalContainer } from '@remirror/core';
import { RemirrorSSR } from '..';

let manager: ExtensionManager;

beforeEach(() => {
  manager = createTestManager();
});

test('should render the ssr component', () => {
  manager.init({ getState: () => state, portalContainer: new NodeViewPortalContainer() });
  const state = manager.createState({ content: initialJson });

  const { container } = render(
    <RemirrorSSR
      attributes={{
        class: 'remirror',
        suppressContentEditableWarning: true,
      }}
      editable={false}
      manager={manager}
      state={state}
    />,
  );
  expect(container).toHaveTextContent('Better docs to come soon...');
});
