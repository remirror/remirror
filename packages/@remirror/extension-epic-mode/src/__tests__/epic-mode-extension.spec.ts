import { isExtensionValid } from '@remirror/testing';

import { EpicModeExtension } from '../..';

test('`EpicModeExtension`: is valid', () => {
  expect(isExtensionValid(EpicModeExtension)).toBeTrue();
});
