import { isExtensionValid } from '@remirror/test-fixtures';

import { PasteRulesExtension } from '..';

test('is is paste rules extension valid', () => {
  expect(isExtensionValid(PasteRulesExtension, {}));
});
