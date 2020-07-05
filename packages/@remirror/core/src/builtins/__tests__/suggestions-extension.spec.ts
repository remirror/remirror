import { isExtensionValid } from '@remirror/testing';

import { SuggestionsExtension } from '..';

test('is suggestions extension valid', () => {
  expect(isExtensionValid(SuggestionsExtension, {}));
});
