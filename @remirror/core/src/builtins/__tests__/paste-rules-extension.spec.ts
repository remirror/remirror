import { isExtensionValid } from '@remirror/test-fixtures';

import { PasteRulesExtension } from '..';

test('is valid', () => {
  expect(isExtensionValid(PasteRulesExtension, {}));
});
