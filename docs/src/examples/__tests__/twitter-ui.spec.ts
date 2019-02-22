const editorSelector = '.ProseMirror';
const emojiButtonSelector = '.EmojiPicker';

const clearEditor = async (selector: string) => {
  await page.click(selector, { clickCount: 3 });
  await page.keyboard.press('Backspace');
};

describe('Twitter UI', () => {
  beforeEach(async () => {
    await jestPuppeteer.resetPage();
    // page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    await page.goto('http://localhost:3000/editors/twitter-ui');
  });

  describe('Links', () => {
    it('should have a twitter editor', async () => {
      await page.focus(editorSelector);
      await page.type(editorSelector, 'This is text https://url.com');
      await expect(page.$eval(editorSelector, e => e.innerHTML)).resolves.toInclude(
        '<a href="https://url.com" role="presentation">https://url.com</a>',
      );
    });

    it('should parse simple urls', async () => {
      await page.type(editorSelector, 'url.com');
      await expect(page.$eval(editorSelector, e => e.innerHTML)).resolves.toContain(
        '<a href="http://url.com" role="presentation">url.com</a>',
      );
      await page.keyboard.press('Backspace');
      await expect(page.$eval(editorSelector, e => e.innerHTML)).resolves.toContain(
        '<a href="http://url.co" role="presentation">url.co</a>',
      );
      await page.keyboard.press('Backspace');
      await expect(page.$eval(editorSelector, e => e.innerHTML)).resolves.toEqual('<p class="">url.c</p>');

      await page.keyboard.type('o.uk');
      await expect(page.$eval(editorSelector, e => e.innerHTML)).resolves.toContain(
        '<a href="http://url.co.uk" role="presentation">url.co.uk</a>',
      );
    });

    it('can handle more complex interactions', async () => {
      await page.type(editorSelector, 'this is the first url.com');
      await page.keyboard.press('Enter');
      await page.type(editorSelector, 'this.com is test.com');
      await page.keyboard.press('Home');
      await page.keyboard.type('split.com ');
      await expect(page.$eval(editorSelector, e => e.innerHTML)).resolves.toIncludeMultiple([
        '<a href="http://split.com" role="presentation">split.com</a>',
        '<a href="http://this.com" role="presentation">this.com</a>',
      ]);

      await page.keyboard.press('ArrowUp');
      await page.keyboard.press('End');
      await page.keyboard.press('Backspace');
      await page.keyboard.press('Backspace');
      await page.keyboard.type('..no .co more url please');
      await expect(page.$eval(editorSelector, e => e.innerHTML)).resolves.not.toInclude('url.com');
    });
    it('should handle the enter key', async () => {
      await page.type(editorSelector, 'this is the first url.com');
      await page.keyboard.press('ArrowLeft');
      await page.keyboard.press('ArrowLeft');
      await page.keyboard.press('ArrowLeft');
      await page.keyboard.press('Enter');

      await expect(page.$eval(editorSelector, e => e.innerHTML)).resolves.not.toInclude('</a>');
    });

    it('should not contain false positives', async () => {
      await page.type(editorSelector, 'http://localhost:3000/ahttps://meowni.ca');
      await expect(page.$eval(editorSelector, e => e.innerHTML)).resolves.not.toInclude('</a>');
    });
  });

  describe('Mentions', () => {
    it('should be able to create simple mentions', async () => {
      await page.type(editorSelector, '@jonathan ');
      await expect(page.$eval(editorSelector, e => e.innerHTML)).resolves.toInclude(
        '<a data-type="@mention">@jonathan</a>',
      );

      await clearEditor(editorSelector);

      await page.type(editorSelector, '#Topic');
      await expect(page.$eval(editorSelector, e => e.innerHTML)).resolves.toInclude(
        '<a data-type="#mention">#Topic</a>',
      );
    });
  });

  describe.skip('Emoji', () => {
    it('should be able to add emoji', async () => {
      // await page.click(editorSelector, '@jonathan');
      // await expect(page.$eval(editorSelector, e => e.innerHTML)).resolves.toInclude(
      //   '<a data-type="@mention">@jonathan</a>',
      // );
      // await clearEditor(editorSelector);
      // await page.type(editorSelector, '#Topic');
      // await expect(page.$eval(editorSelector, e => e.innerHTML)).resolves.toInclude(
      //   '<a data-type="#mention">#Topic</a>',
      // );
    });
  });
});
