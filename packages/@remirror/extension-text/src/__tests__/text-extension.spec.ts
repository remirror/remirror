import { isExtensionValid } from '@remirror/testing';

import { TextExtension } from '../..';

test('is valid', () => {
  expect(isExtensionValid(TextExtension, {}));
});
