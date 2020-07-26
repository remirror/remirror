import { isExtensionValid } from '@remirror/testing';

import { SuggesterExtension } from '..';

test('`SuggesterExtension`: is valid', () => {
  expect(isExtensionValid(SuggesterExtension)).toBeTrue();
});
