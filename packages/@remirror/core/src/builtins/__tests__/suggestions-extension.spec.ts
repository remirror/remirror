import { isExtensionValid } from '@remirror/testing';

import { SuggestionsExtension } from '..';

test('`SuggestionsExtension`: is valid', () => {
  expect(isExtensionValid(SuggestionsExtension)).toBeTrue();
});
