import { isExtensionValid } from '@remirror/testing';

import { ReactSSRExtension } from '../..';

test('is react ssr extension valid', () => {
  expect(isExtensionValid(ReactSSRExtension));
});
