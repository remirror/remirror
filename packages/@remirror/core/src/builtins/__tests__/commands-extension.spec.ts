import { isExtensionValid } from '@remirror/testing';

import { CommandsExtension } from '..';

test('is commands extension valid', () => {
  expect(isExtensionValid(CommandsExtension, {}));
});
