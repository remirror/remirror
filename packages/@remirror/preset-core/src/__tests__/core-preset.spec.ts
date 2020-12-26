import { GapCursorExtension } from '@remirror/extension-gap-cursor';
import { hideConsoleError } from '@remirror/testing';

import { createCoreManager } from '../..';

hideConsoleError(true);

test('it can exclude extensions', () => {
  const manager = createCoreManager([], { core: { excludeExtensions: ['gapCursor'] } });
  expect(() => manager.getExtension(GapCursorExtension)).toThrow();
});
