import { isExtensionValid } from '@remirror/test-fixtures';

import { HelpersExtension } from '..';

test('is helpers extension valid', () => {
  expect(isExtensionValid(HelpersExtension, {}));
});
