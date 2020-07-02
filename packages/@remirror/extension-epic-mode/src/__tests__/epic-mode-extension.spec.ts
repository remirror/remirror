import { isExtensionValid } from '@remirror/test-fixtures';

import { EpicModeExtension } from '../..';

test('is epic mode extension valid', () => {
  expect(isExtensionValid(EpicModeExtension));
});
