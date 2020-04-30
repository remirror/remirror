import { render } from '@testing-library/react';
import React from 'react';

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
