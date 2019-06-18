/**
 * @jest-environment node
 */

import React from 'react';
import { renderToString } from 'react-dom/server';

import { docNodeBasicJSON } from '@test-fixtures/object-nodes';
import { WysiwygEditor } from '..';

test('it renders within an ssr environment', () => {
  const reactString = renderToString(<WysiwygEditor initialContent={docNodeBasicJSON} />);
  expect(reactString).toInclude('basic');
});
