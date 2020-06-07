import { isExtensionValid } from '@remirror/test-fixtures';

import { ItalicExtension } from '..';

test('is valid', () => {
  expect(isExtensionValid(ItalicExtension, {}));
});
