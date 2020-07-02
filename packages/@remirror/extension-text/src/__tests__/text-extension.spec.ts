import { isExtensionValid } from '@remirror/test-fixtures';

import { TextExtension } from '../..';

test('is valid', () => {
  expect(isExtensionValid(TextExtension, {}));
});
