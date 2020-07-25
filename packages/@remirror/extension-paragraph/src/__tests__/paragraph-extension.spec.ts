import { isExtensionValid } from '@remirror/testing';

import { ParagraphExtension } from '../..';

test('`ParagraphExtension`: is valid', () => {
  expect(isExtensionValid(ParagraphExtension)).toBeTrue();
});
