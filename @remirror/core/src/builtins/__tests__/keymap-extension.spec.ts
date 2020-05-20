import { isExtensionValid } from '@remirror/test-fixtures';

import { KeymapExtension } from '..';

test('is keymaps extension valid', () => {
  expect(isExtensionValid(KeymapExtension, {}));
});
