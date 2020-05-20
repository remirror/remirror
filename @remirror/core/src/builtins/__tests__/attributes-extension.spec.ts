import { isExtensionValid } from '@remirror/test-fixtures';

import { AttributesExtension } from '..';

test('is valid', () => {
  expect(isExtensionValid(AttributesExtension, {}));
});
