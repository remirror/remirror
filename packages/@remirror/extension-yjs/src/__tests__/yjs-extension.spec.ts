import { isExtensionValid } from '@remirror/testing';

import { YjsExtension } from '..';

test('is valid', () => {
  expect(isExtensionValid(YjsExtension, {} as any));
});
