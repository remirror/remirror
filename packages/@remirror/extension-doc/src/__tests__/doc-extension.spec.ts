import { isExtensionValid } from '@remirror/testing';

import { DocExtension } from '../..';

test('is doc extension valid', () => {
  expect(isExtensionValid(DocExtension));
});
