import { isExtensionValid } from '@remirror/test-fixtures';

import { SchemaExtension } from '..';

test('is valid', () => {
  expect(isExtensionValid(SchemaExtension, {}));
});
