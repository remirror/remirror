import { isExtensionValid } from '@remirror/testing';

import { AttributesExtension } from '..';

test('`AttributesExtension`: is valid', () => {
  expect(isExtensionValid(AttributesExtension)).toBeTrue();
});
