import { isExtensionValid } from '@remirror/testing';

import { PasteRulesExtension } from '..';

test('is is paste rules extension valid', () => {
  expect(isExtensionValid(PasteRulesExtension, {}));
});
