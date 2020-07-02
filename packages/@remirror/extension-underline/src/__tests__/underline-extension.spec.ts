import { isExtensionValid } from '@remirror/test-fixtures';

import { UnderlineExtension } from '..';

test('is valid', () => {
  expect(isExtensionValid(UnderlineExtension, {}));
});
