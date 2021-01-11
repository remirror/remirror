// If these tests fail then something is wrong with the build process.

import { goto } from './helpers';

describe('Smoke tests', () => {
  // eslint-disable-next-line jest/expect-expect
  it('can navigate to the home page', async () => {
    await goto(__SERVER__.home);
  });
});
