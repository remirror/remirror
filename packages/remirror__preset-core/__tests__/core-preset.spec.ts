import { hideConsoleError } from 'testing';
import { GapCursorExtension } from '@remirror/extension-gap-cursor';

import { createCoreManager } from '../';

hideConsoleError(true);

test('it can exclude extensions', () => {
  const manager = createCoreManager([], { core: { excludeExtensions: ['gapCursor'] } });
  expect(() => manager.getExtension(GapCursorExtension)).toThrow();
});
