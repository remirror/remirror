import { isExtensionValid } from '@remirror/testing';

import { HelpersExtension } from '..';

test('is helpers extension valid', () => {
  expect(isExtensionValid(HelpersExtension, {}));
});
