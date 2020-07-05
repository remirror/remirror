import { isExtensionValid } from '@remirror/testing';

import { PlaceholderExtension } from '../placeholder-extension';

test('is valid', () => {
  expect(isExtensionValid(PlaceholderExtension, {}));
});
