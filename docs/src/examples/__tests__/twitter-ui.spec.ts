// const selector = '[data-test-id=twitter-ui]';

const selector = '.ProseMirror';

describe('Twitter UI', () => {
  beforeAll(async () => {
    await page.goto('http://localhost:3000/editors/twitter-ui');
    // await jestPuppeteer.debug();
  });

  it('should have a twitter editor', async () => {
    await page.focus(selector);
    await page.type(selector, 'This is text url.com', { delay: 1 });
  });
});
