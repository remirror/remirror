// If these tests fail then something is wrong with the build process.

describe('Smoke tests', () => {
  it('can navigate to the home page', async () => {
    await page.goto(__SERVER__.home);
  });
});
