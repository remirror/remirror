import { environment } from '@remirror/core';

import { remirrorMatchers } from './jest-remirror-matchers';
import { jsdomExtras, jsdomPolyfill } from './jsdom-polyfills';

export const setupRemirrorEnvironment = () => {
  /* Only continue when in a DOM environment */
  if (!environment.isBrowser) {
    return;
  }

  /* Add matchers to jest */
  expect.extend(remirrorMatchers);

  /* Polyfills for jsdom */
  jsdomPolyfill();

  /* Extras for prosemirror testing */
  jsdomExtras();
};
