import { isExtensionValid } from '@remirror/testing';

import { NodeViewsExtension } from '..';

test('is is node views extension valid', () => {
  expect(isExtensionValid(NodeViewsExtension, {}));
});
