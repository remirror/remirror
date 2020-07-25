import { isExtensionValid } from '@remirror/testing';

import { PositionTrackerExtension } from '../..';

test('`PositionTrackerExtension`: is valid', () => {
  expect(isExtensionValid(PositionTrackerExtension)).toBeTrue();
});
