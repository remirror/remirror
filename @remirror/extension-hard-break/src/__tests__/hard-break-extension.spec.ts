import { isExtensionValid } from '@remirror/test-fixtures';

import { HardBreakExtension } from '..';

test('is valid', () => {
  expect(isExtensionValid(HardBreakExtension, {}));
});
