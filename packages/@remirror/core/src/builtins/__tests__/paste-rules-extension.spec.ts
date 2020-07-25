import { isExtensionValid } from '@remirror/testing';

import { PasteRulesExtension } from '..';

test('`PasteRulesExtension`: is valid', () => {
  expect(isExtensionValid(PasteRulesExtension)).toBeTrue();
});
