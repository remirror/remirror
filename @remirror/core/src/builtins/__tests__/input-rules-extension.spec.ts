import { isExtensionValid } from '@remirror/test-fixtures';

import { InputRulesExtension } from '..';

test('is valid', () => {
  expect(isExtensionValid(InputRulesExtension, {}));
});
