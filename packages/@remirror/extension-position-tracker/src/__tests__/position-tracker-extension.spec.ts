import { isExtensionValid } from '@remirror/testing';

import { PositionTrackerExtension } from '../..';

test('is valid', () => {
  expect(isExtensionValid(PositionTrackerExtension, {}));
});
