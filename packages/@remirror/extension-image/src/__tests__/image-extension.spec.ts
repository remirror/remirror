import { isExtensionValid } from '@remirror/testing';

import { ImageExtension } from '../..';

test('is image extension valid', () => {
  expect(isExtensionValid(ImageExtension));
});
