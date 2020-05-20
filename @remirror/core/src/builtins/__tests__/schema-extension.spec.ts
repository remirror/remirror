import { isExtensionValid } from '@remirror/test-fixtures';

import { SchemaExtension } from '..';

test('is schema extension valid', () => {
  expect(isExtensionValid(SchemaExtension, {}));
});
