import { isExtensionValid } from '@remirror/testing';

import { StrikeExtension } from '..';

test('is valid', () => {
  expect(isExtensionValid(StrikeExtension, {}));
});
