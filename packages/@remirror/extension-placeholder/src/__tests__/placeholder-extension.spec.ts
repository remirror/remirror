import { isExtensionValid } from '@remirror/test-fixtures';

import { PlaceholderExtension } from '../placeholder-extension';

test('is valid', () => {
  expect(isExtensionValid(PlaceholderExtension, {}));
});
