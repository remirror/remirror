import { isExtensionValid } from '@remirror/testing';

import { CollaborationExtension } from '..';

test('`CollaborationExtension`: is valid', () => {
  expect(isExtensionValid(CollaborationExtension, { clientID: 'abc' })).toBeTrue();
});
