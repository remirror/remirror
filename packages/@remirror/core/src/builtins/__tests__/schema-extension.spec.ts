import { isExtensionValid } from '@remirror/testing';

import { SchemaExtension } from '..';

test('is schema extension valid', () => {
  expect(isExtensionValid(SchemaExtension, {}));
});
