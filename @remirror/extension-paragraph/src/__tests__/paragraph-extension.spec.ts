import { isExtensionValid } from '@remirror/test-fixtures';

import { ParagraphExtension } from '../..';

test('is valid', () => {
  expect(isExtensionValid(ParagraphExtension, {}));
});
