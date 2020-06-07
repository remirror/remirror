import { isExtensionValid } from '@remirror/test-fixtures';

import { TemplateExtension } from '..';

test('is valid', () => {
  expect(isExtensionValid(TemplateExtension, {}));
});
