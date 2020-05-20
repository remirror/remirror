import { isExtensionValid } from '@remirror/test-fixtures';

import { NodeViewsExtension } from '..';

test('is valid', () => {
  expect(isExtensionValid(NodeViewsExtension, {}));
});
