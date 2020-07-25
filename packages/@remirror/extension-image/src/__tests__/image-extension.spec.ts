import { isExtensionValid } from '@remirror/testing';

import { ImageExtension } from '../..';

test('`ImageExtension`: is valid', () => {
  expect(isExtensionValid(ImageExtension)).toBeTrue();
});
