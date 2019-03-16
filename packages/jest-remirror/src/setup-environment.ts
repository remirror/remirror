import { environment } from '@remirror/core';
import { toHaveNoViolations } from 'jest-axe';
import { createSerializer, matchers } from 'jest-emotion';
import { jsdomExtras, jsdomPolyfill } from './jsdom-polyfills';
import { remirrorMatchers } from './matchers';

export const setupRemirrorEnvironment = () => {
  // The following can only be run in a DOM environment
  if (!environment.isBrowser) {
    return;
  }

  require('react-testing-library/cleanup-after-each');
  require('jest-dom/extend-expect');
  expect.addSnapshotSerializer(createSerializer({}));

  expect.extend(toHaveNoViolations);
  expect.extend(matchers);

  /* Add matchers to jest */
  expect.extend(remirrorMatchers);

  /* Polyfills for jsdom */
  jsdomPolyfill();

  /* Extras for prosemirror testing */
  jsdomExtras();
};
