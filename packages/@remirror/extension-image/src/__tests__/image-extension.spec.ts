import { isExtensionValid } from '@remirror/test-fixtures';

import { ImageExtension } from '../..';

test('is image extension valid', () => {
  expect(isExtensionValid(ImageExtension));
});
