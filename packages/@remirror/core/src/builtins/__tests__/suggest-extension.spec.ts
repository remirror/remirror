import { isExtensionValid } from '@remirror/testing';

import { SuggestExtension } from '..';

test('`SuggestExtension`: is valid', () => {
  expect(isExtensionValid(SuggestExtension)).toBeTrue();
});
