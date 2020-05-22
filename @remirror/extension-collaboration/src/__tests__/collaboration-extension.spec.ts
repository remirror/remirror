import { isExtensionValid } from '@remirror/test-fixtures';

import { CollaborationExtension } from '..';

test('is collaboration extension valid', () => {
  isExtensionValid(CollaborationExtension, { clientID: '' });
});
