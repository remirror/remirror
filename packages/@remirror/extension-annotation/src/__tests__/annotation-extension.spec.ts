import { isExtensionValid } from '@remirror/testing';

import { AnnotationExtension } from '..';

test('is valid', () => {
  expect(isExtensionValid(AnnotationExtension, {}));
});
