import { isExtensionValid } from '@remirror/test-fixtures';

import { StrikeExtension } from '..';

test('is valid', () => {
  expect(isExtensionValid(StrikeExtension, {}));
});
