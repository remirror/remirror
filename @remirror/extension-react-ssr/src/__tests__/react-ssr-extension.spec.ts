import { isExtensionValid } from '@remirror/test-fixtures';

import { ReactSSRExtension } from '../..';

test('is react ssr extension valid', () => {
  expect(isExtensionValid(ReactSSRExtension));
});
