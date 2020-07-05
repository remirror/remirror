import { isExtensionValid } from '@remirror/testing';

import { ItalicExtension } from '..';

test('is valid', () => {
  expect(isExtensionValid(ItalicExtension, {}));
});
