import { isExtensionValid } from '@remirror/testing';

import { AttributesExtension } from '..';

test('is attributes extension valid', () => {
  expect(isExtensionValid(AttributesExtension, {}));
});
