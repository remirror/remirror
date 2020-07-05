import { isExtensionValid } from '@remirror/testing';

import { UnderlineExtension } from '..';

test('is valid', () => {
  expect(isExtensionValid(UnderlineExtension, {}));
});
