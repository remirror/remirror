import { isExtensionValid } from '@remirror/test-fixtures';

import { CommandsExtension } from '..';

test('is valid', () => {
  expect(isExtensionValid(CommandsExtension, {}));
});
