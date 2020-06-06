import { isExtensionValid } from '@remirror/test-fixtures';

import { GapCursorExtension } from '../..';

test('is valid', () => {
  expect(isExtensionValid(GapCursorExtension, {}));
});
