import { isExtensionValid } from '@remirror/testing';

import { GapCursorExtension } from '../..';

test('`GapCursorExtension`: is valid', () => {
  expect(isExtensionValid(GapCursorExtension)).toBeTrue();
});
