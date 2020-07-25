import { isExtensionValid } from '@remirror/testing';

import { TemplateExtension } from '..';

test('`TemplateExtension`: is valid', () => {
  expect(isExtensionValid(TemplateExtension)).toBeTrue();
});
