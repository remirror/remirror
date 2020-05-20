import { isExtensionValid } from '@remirror/test-fixtures';

import { HelpersExtension } from '..';

test('is valid', () => {
  expect(isExtensionValid(HelpersExtension, {}));
});
