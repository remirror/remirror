const selector = '.ProseMirror';

describe('Twitter UI', () => {
  beforeEach(async () => {
    await jestPuppeteer.resetPage();
    await page.goto('http://localhost:3000/editors/twitter-ui');
  });

  describe('Links', () => {
    it('should have a twitter editor', async () => {
      await page.focus(selector);
      await page.type(selector, 'This is text https://url.com');
      await expect(page.$eval(selector, e => e.innerHTML)).resolves.toInclude(
        '<a href="https://url.com" role="presentation">https://url.com</a>',
      );
    });

    it('should parse simple urls', async () => {
      await page.type(selector, 'url.com');
      await expect(page.$eval(selector, e => e.innerHTML)).resolves.toContain(
        '<a href="http://url.com" role="presentation">url.com</a>',
      );
      await page.keyboard.press('Backspace');
      await expect(page.$eval(selector, e => e.innerHTML)).resolves.toContain(
        '<a href="http://url.co" role="presentation">url.co</a>',
      );
      await page.keyboard.press('Backspace');
      await expect(page.$eval(selector, e => e.innerHTML)).resolves.toEqual('<p class="">url.c</p>');

      await page.keyboard.type('o.uk');
      await expect(page.$eval(selector, e => e.innerHTML)).resolves.toContain(
        '<a href="http://url.co.uk" role="presentation">url.co.uk</a>',
      );
    });

    it('can handle more complex interactions', async () => {
      await page.type(selector, 'this is the first url.com');
      await page.keyboard.press('Enter');
      await page.type(selector, 'this.com is test.com');
      await page.keyboard.press('Home');
      await page.keyboard.type('split.com ');
      await expect(page.$eval(selector, e => e.innerHTML)).resolves.toIncludeMultiple([
        '<a href="http://split.com" role="presentation">split.com</a>',
        '<a href="http://this.com" role="presentation">this.com</a>',
      ]);

      await page.keyboard.press('ArrowUp');
      await page.keyboard.press('End');
      await page.keyboard.press('Backspace');
      await page.keyboard.press('Backspace');
      await page.keyboard.type('..no .co more url please');
      await expect(page.$eval(selector, e => e.innerHTML)).resolves.not.toInclude('url.com');
    });

    it('should handle the enter key', async () => {
      await page.type(selector, 'this is the first url.com');
      await page.keyboard.press('ArrowLeft');
      await page.keyboard.press('ArrowLeft');
      await page.keyboard.press('ArrowLeft');
      await page.keyboard.press('Enter');

      await expect(page.$eval(selector, e => e.innerHTML)).resolves.not.toInclude('</a>');
    });
  });
});
