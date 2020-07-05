import { isExtensionValid } from '@remirror/testing';

import { CollaborationExtension } from '..';

test('is collaboration extension valid', () => {
  isExtensionValid(CollaborationExtension, { clientID: 'abc' });
});
