import { isExtensionValid } from '@remirror/testing';

import { DropCursorExtension } from '..';

test('`DropCursorExtension`: is valid', () => {
  expect(isExtensionValid(DropCursorExtension)).toBeTrue();
});
