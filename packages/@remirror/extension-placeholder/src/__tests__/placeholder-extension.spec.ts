import { isExtensionValid } from '@remirror/testing';

import { PlaceholderExtension } from '../placeholder-extension';

test('`PlaceholderExtension`: is valid', () => {
  expect(isExtensionValid(PlaceholderExtension));
});
