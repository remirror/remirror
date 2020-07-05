import { isExtensionValid } from '@remirror/testing';

import { EpicModeExtension } from '../..';

test('is epic mode extension valid', () => {
  expect(isExtensionValid(EpicModeExtension));
});
