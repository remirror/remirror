import { isExtensionValid } from '@remirror/test-fixtures';

import { InputRulesExtension } from '..';

test('is input rules extension valid', () => {
  expect(isExtensionValid(InputRulesExtension, {}));
});
