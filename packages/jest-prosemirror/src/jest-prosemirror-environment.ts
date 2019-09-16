import { prosemirrorMatchers } from './jest-prosemirror-matchers';

/**
 * Setup the environment automatically for jest-prosemirror
 */
export const setupProsemirrorEnvironment = () => {
  expect.extend(prosemirrorMatchers);
};
