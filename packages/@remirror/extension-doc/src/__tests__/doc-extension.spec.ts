import { isExtensionValid } from '@remirror/test-fixtures';

import { DocExtension } from '../..';

test('is doc extension valid', () => {
  expect(isExtensionValid(DocExtension));
});
