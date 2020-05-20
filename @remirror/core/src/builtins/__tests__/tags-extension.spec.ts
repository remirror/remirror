import { isExtensionValid } from '@remirror/test-fixtures';

import { TagsExtension } from '..';

test('is valid', () => {
  expect(isExtensionValid(TagsExtension, {}));
});
