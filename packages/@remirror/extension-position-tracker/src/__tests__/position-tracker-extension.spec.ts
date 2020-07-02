import { isExtensionValid } from '@remirror/test-fixtures';

import { PositionTrackerExtension } from '../..';

test('is valid', () => {
  expect(isExtensionValid(PositionTrackerExtension, {}));
});
