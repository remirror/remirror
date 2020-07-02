import { isExtensionValid } from '@remirror/test-fixtures';

import { CommandsExtension } from '..';

test('is commands extension valid', () => {
  expect(isExtensionValid(CommandsExtension, {}));
});
