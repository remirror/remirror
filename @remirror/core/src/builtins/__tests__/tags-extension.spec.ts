import { isExtensionValid } from '@remirror/test-fixtures';

import { TagsExtension } from '..';

test('is tags extension valid', () => {
  expect(isExtensionValid(TagsExtension, {}));
});
