import { isExtensionValid } from '@remirror/test-fixtures';

import { SuggestionsExtension } from '..';

test('is valid', () => {
  expect(isExtensionValid(SuggestionsExtension, {}));
});
