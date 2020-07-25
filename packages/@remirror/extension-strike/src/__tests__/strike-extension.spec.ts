import { isExtensionValid } from '@remirror/testing';

import { StrikeExtension } from '..';

test('`StrikeExtension`: is valid', () => {
  expect(isExtensionValid(StrikeExtension)).toBeTrue();
});
