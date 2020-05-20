import { isExtensionValid } from '@remirror/test-fixtures';

import { PluginsExtension } from '..';

test('is valid', () => {
  expect(isExtensionValid(PluginsExtension, {}));
});
