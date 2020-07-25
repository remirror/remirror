import { isExtensionValid } from '@remirror/testing';

import { SchemaExtension } from '..';

test('`SchemaExtension`: is valid', () => {
  expect(isExtensionValid(SchemaExtension)).toBeTrue();
});
