import { isExtensionValid } from '@remirror/testing';

import { TemplateExtension } from '..';

test('is valid', () => {
  expect(isExtensionValid(TemplateExtension, {}));
});
