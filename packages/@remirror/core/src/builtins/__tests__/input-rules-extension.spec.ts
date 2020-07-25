import { isExtensionValid } from '@remirror/testing';

import { InputRulesExtension } from '..';

test('`InputRulesExtension`: is valid', () => {
  expect(isExtensionValid(InputRulesExtension)).toBeTrue();
});
