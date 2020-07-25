import { isExtensionValid } from '@remirror/testing';

import { NodeViewsExtension } from '..';

test('`NodeViewsExtension`: is valid', () => {
  expect(isExtensionValid(NodeViewsExtension)).toBeTrue();
});
