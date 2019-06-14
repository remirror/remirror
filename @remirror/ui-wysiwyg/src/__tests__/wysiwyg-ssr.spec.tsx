/**
 * @jest-environment node
 */

import React from 'react';
import { renderToString } from 'react-dom/server';

import { docNodeBasicJSON } from '@test-fixtures/object-nodes';
import { WysiwygUI } from '..';

test('it renders within an ssr environment', () => {
  const reactString = renderToString(<WysiwygUI initialContent={docNodeBasicJSON} />);
  expect(reactString).toInclude('basic');
});
