import { prosemirrorMatchers } from './jest-prosemirror-matchers';

/**
 * Setup the environment automatically for jest-prosemirror
 */
export const setupProsemirrorEnvironment = (): void => {
  expect.extend(prosemirrorMatchers);
};
