/**
 * @jest-environment node
 */

/** @jsx jsx */

import { jsx } from '@emotion/core';
import { ExtensionManager } from '@remirror/core';
import { createTestManager, helpers, initialJson } from '@remirror/test-fixtures';
import { renderToString } from 'react-dom/server';

import { RemirrorSSR } from '..';

let manager: ExtensionManager;

beforeEach(() => {
  manager = createTestManager();
});

test('should render the ssr component', () => {
  manager.init({ ...helpers, getState: () => state });
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
