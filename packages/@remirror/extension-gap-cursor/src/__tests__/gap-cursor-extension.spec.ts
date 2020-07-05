import { isExtensionValid } from '@remirror/testing';

import { GapCursorExtension } from '../..';

test('is valid', () => {
  expect(isExtensionValid(GapCursorExtension, {}));
});
