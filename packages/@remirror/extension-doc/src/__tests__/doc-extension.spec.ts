import { isExtensionValid } from '@remirror/testing';

import { DocExtension } from '../..';

test('`DocExtension`: is valid', () => {
  expect(isExtensionValid(DocExtension)).toBeTrue();
});
