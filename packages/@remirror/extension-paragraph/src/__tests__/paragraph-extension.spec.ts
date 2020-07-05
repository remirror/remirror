import { isExtensionValid } from '@remirror/testing';

import { ParagraphExtension } from '../..';

test('is valid', () => {
  expect(isExtensionValid(ParagraphExtension, {}));
});
