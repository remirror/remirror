import { isExtensionValid } from '@remirror/test-fixtures';

import { HorizontalRuleExtension } from '..';

test('is valid', () => {
  expect(isExtensionValid(HorizontalRuleExtension, {}));
});
