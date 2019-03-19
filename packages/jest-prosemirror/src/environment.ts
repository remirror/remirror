import { prosemirrorMatchers } from './matchers';

/**
 * Setup the environment automatically for jest-prosemirror
 */
export const setupProsemirrorEnvironment = () => {
  expect.extend(prosemirrorMatchers);
};
