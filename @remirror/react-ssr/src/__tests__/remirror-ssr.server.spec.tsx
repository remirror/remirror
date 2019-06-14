/**
 * @jest-environment node
 */

import React from 'react';

import { initialJson, manager } from '@test-fixtures/schema-helpers';
import { renderToString } from 'react-dom/server';

import { RemirrorSSR } from '..';

const state = manager.createState({ content: initialJson });

test('should render the ssr component', () => {
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
