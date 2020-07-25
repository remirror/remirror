import { isExtensionValid } from '@remirror/testing';

import { ItalicExtension } from '..';

test('`ItalicExtension`: is valid', () => {
  expect(isExtensionValid(ItalicExtension)).toBeTrue();
});
