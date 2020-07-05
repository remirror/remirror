import { isExtensionValid } from '@remirror/testing';

import { HorizontalRuleExtension } from '..';

test('is valid', () => {
  expect(isExtensionValid(HorizontalRuleExtension, {}));
});
