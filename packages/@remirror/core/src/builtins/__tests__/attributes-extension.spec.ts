import { isExtensionValid } from '@remirror/test-fixtures';

import { AttributesExtension } from '..';

test('is attributes extension valid', () => {
  expect(isExtensionValid(AttributesExtension, {}));
});
