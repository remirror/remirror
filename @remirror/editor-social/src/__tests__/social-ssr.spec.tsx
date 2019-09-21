/**
 * @jest-environment node
 */

import React from 'react';
import { renderToString } from 'react-dom/server';

import { docNodeBasicJSON } from '@remirror/test-fixtures';
import { SocialEditor } from '..';

test('it renders within an ssr environment', () => {
  // global.renderToString = renderToString;
  const reactString = renderToString(
    <SocialEditor
      userData={[]}
      tagData={[]}
      onMentionChange={console.log}
      initialContent={docNodeBasicJSON}
    />,
  );
  expect(reactString).toInclude('basic');
});
