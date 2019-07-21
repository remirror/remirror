// A test to ensure that the server builds and opens the home url.

describe('Basic Home', () => {
  it('can navigate to the home page', async () => {
    await page.goto(__SERVER__.home);
  });
});
