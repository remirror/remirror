import { isExtensionValid } from '@remirror/testing';

import { YjsExtension } from '..';

test('`YjsExtension`: is valid', () => {
  expect(isExtensionValid(YjsExtension, {} as any)).toBeTrue();
});
