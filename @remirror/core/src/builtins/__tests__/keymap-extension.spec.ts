import { isExtensionValid } from '@remirror/test-fixtures';

import { KeymapExtension } from '..';

test('is valid', () => {
  expect(isExtensionValid(KeymapExtension, {}));
});
