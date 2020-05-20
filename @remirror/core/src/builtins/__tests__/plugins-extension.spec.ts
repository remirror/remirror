import { isExtensionValid } from '@remirror/test-fixtures';

import { PluginsExtension } from '..';

test('is is plugins extension valid', () => {
  expect(isExtensionValid(PluginsExtension, {}));
});
