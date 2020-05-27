import { isExtensionValid } from '@remirror/test-fixtures';

import { PlaceholderExtension } from '../../dist/extension-placeholder.cjs';

test('is valid', () => {
  expect(isExtensionValid(PlaceholderExtension, {}));
});
