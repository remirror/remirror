import { isExtensionValid } from '@remirror/test-fixtures';

import { SuggestionsExtension } from '..';

test('is suggestions extension valid', () => {
  expect(isExtensionValid(SuggestionsExtension, {}));
});
