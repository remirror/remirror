import { isExtensionValid } from '@remirror/test-fixtures';

import { NodeViewsExtension } from '..';

test('is is node views extension valid', () => {
  expect(isExtensionValid(NodeViewsExtension, {}));
});
