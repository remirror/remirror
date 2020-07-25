import { isExtensionValid } from '@remirror/testing';

import { ReactSSRExtension } from '../..';

test('`ReactSSRExtension`: is valid', () => {
  expect(isExtensionValid(ReactSSRExtension)).toBeTrue();
});
