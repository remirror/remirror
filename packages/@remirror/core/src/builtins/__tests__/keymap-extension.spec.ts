import { isExtensionValid } from '@remirror/testing';

import { KeymapExtension } from '..';

test('`KeymapExtension`: is valid', () => {
  expect(isExtensionValid(KeymapExtension)).toBeTrue();
});
