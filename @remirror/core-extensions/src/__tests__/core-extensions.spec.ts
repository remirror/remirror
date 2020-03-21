import { isExtension } from '@remirror/core';

import { baseExtensions } from '../core-extensions';

test('baseExtensions', () => {
  const names = baseExtensions.map((obj) => (isExtension(obj) ? obj.name : obj.extension.name));

  expect(names).toContainValues([
    'doc',
    'text',
    'paragraph',
    'composition',
    'history',
    'gapCursor',
    'dropCursor',
    'baseKeymap',
  ]);
});
