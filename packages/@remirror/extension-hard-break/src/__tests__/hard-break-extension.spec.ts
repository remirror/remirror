import { isExtensionValid } from '@remirror/testing';

import { HardBreakExtension } from '..';

test('is valid', () => {
  expect(isExtensionValid(HardBreakExtension, {}));
});
