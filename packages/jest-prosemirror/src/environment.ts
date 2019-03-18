import { prosemirrorMatchers } from './matchers';

/**
 * Setup the environment automatically for jest-prosemirror
 */
export const setupEnvironment = () => {
  expect.extend(prosemirrorMatchers);
};
