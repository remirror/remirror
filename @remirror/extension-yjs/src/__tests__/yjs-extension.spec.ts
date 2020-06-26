import { isExtensionValid } from '@remirror/test-fixtures';

import { YjsExtension } from '..';

test('is valid', () => {
  expect(isExtensionValid(YjsExtension));
});
