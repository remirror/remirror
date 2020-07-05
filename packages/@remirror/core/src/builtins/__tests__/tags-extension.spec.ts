import { isExtensionValid } from '@remirror/testing';

import { TagsExtension } from '..';

test('is tags extension valid', () => {
  expect(isExtensionValid(TagsExtension, {}));
});
