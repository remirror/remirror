import { isExtensionValid } from '@remirror/testing';

import { PluginsExtension } from '..';

test('is is plugins extension valid', () => {
  expect(isExtensionValid(PluginsExtension, {}));
});
