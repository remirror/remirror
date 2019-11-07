/**
 * @jest-environment node
 */

/** @jsx jsx */

import { jsx } from '@emotion/core';
import { renderToString } from 'react-dom/server';

import { docNodeBasicJSON } from '@remirror/test-fixtures';
import { SocialEditor } from '..';
import { noop } from '@remirror/core';

test('it renders within an ssr environment', () => {
  // global.renderToString = renderToString;
  const reactString = renderToString(
    <SocialEditor userData={[]} tagData={[]} onMentionChange={noop} initialContent={docNodeBasicJSON} />,
  );
  expect(reactString).toInclude('basic');
});
