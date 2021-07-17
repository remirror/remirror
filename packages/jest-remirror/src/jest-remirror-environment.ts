import { environment } from '@remirror/core';

import { remirrorMatchers } from './jest-remirror-matchers';
import { jsdomPolyfill } from './jsdom-polyfills';

/**
 * Run all the polyfills that have been identified for making `jsdom` work
 * correctly for common tests.
 *
 * If you notice any missing functionality which can be polyfilled please open
 * an issue.
 */
export function setupRemirrorEnvironment(): void {
  // Only continue when in a DOM environment
  if (!environment.isBrowser) {
    return;
  }

  // Add matchers to jest
  expect.extend(remirrorMatchers);

  // Polyfills for jsdom
  jsdomPolyfill();
}
