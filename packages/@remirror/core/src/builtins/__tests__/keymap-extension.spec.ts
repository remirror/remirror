import { isExtensionValid } from '@remirror/testing';

import { KeymapExtension } from '..';

test('is keymaps extension valid', () => {
  expect(isExtensionValid(KeymapExtension, {}));
});
