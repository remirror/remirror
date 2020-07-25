import { isExtensionValid } from '@remirror/testing';

import { TextExtension } from '../..';

test('`TextExtension`: is valid', () => {
  expect(isExtensionValid(TextExtension)).toBeTrue();
});
