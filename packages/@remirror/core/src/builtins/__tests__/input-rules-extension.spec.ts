import { isExtensionValid } from '@remirror/testing';

import { InputRulesExtension } from '..';

test('is input rules extension valid', () => {
  expect(isExtensionValid(InputRulesExtension, {}));
});
