import { isExtensionValid } from '@remirror/test-fixtures';

import { BlockquoteExtension } from '../..';

test('is valid', () => {
  expect(isExtensionValid(BlockquoteExtension, {}));
});
