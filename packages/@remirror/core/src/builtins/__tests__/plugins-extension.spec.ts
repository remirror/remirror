import { isExtensionValid } from '@remirror/testing';

import { PluginsExtension } from '..';

test('`PluginsExtension`: is valid', () => {
  expect(isExtensionValid(PluginsExtension)).toBeTrue();
});
