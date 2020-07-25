import { isExtensionValid } from '@remirror/testing';

import { UnderlineExtension } from '..';

test('`UnderlineExtension`: is valid', () => {
  expect(isExtensionValid(UnderlineExtension)).toBeTrue();
});
