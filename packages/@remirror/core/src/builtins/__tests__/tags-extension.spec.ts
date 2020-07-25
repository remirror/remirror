import { isExtensionValid } from '@remirror/testing';

import { TagsExtension } from '..';

test('`TagsExtension`: is valid', () => {
  expect(isExtensionValid(TagsExtension)).toBeTrue();
});
