const editorSelector = '.ProseMirror';
const emojiButtonSelector = '.EmojiPicker';
const sel = (...selectors: string[]) => selectors.join(' ');

const innerHtml = async (selector: string) => page.$eval(selector, e => e.innerHTML);
const outerHTML = async (selector: string) => page.$eval(selector, e => e.outerHTML);

const clearEditor = async (selector: string) => {
  await page.click(selector, { clickCount: 3 });
  await page.keyboard.press('Backspace');
};

describe('Twitter UI', () => {
  beforeEach(async () => {
    await jestPuppeteer.resetPage();
    page.setDefaultNavigationTimeout(120000);
    await page.goto('http://localhost:3000/editors/ui-twitter');
  });

  describe('Links', () => {
    it('should have a twitter editor', async () => {
      await page.focus(editorSelector);
      await page.type(editorSelector, 'This is text https://url.com');
      await expect(innerHtml(editorSelector)).resolves.toInclude(
        '<a href="https://url.com" role="presentation">https://url.com</a>',
      );
    });

    it('should parse simple urls', async () => {
      await page.type(editorSelector, 'url.com');
      await expect(innerHtml(editorSelector)).resolves.toContain(
        '<a href="http://url.com" role="presentation">url.com</a>',
      );
      await page.keyboard.press('Backspace');
      await expect(innerHtml(editorSelector)).resolves.toContain(
        '<a href="http://url.co" role="presentation">url.co</a>',
      );
      await page.keyboard.press('Backspace');
      await expect(innerHtml(editorSelector)).resolves.toEqual('<p class="">url.c</p>');

      await page.keyboard.type('o.uk');
      await expect(innerHtml(editorSelector)).resolves.toContain(
        '<a href="http://url.co.uk" role="presentation">url.co.uk</a>',
      );
    });

    it('can handle more complex interactions', async () => {
      await page.type(editorSelector, 'this is the first url.com');
      await page.keyboard.press('Enter');
      await page.type(editorSelector, 'this.com is test.com');
      await page.keyboard.press('Home');
      await page.keyboard.type('split.com ');
      await expect(innerHtml(editorSelector)).resolves.toIncludeMultiple([
        '<a href="http://split.com" role="presentation">split.com</a>',
        '<a href="http://this.com" role="presentation">this.com</a>',
      ]);

      await page.keyboard.press('ArrowUp');
      await page.keyboard.press('End');
      await page.keyboard.press('Backspace');
      await page.keyboard.press('Backspace');
      await page.keyboard.type('..no .co more url please');
      await expect(innerHtml(editorSelector)).resolves.not.toInclude('url.com');
    });
    it('should handle the enter key', async () => {
      await page.type(editorSelector, 'this is the first url.com');
      await page.keyboard.press('ArrowLeft');
      await page.keyboard.press('ArrowLeft');
      await page.keyboard.press('ArrowLeft');
      await page.keyboard.press('Enter');

      await expect(innerHtml(editorSelector)).resolves.not.toInclude('</a>');
    });

    it('should not contain false positives', async () => {
      await page.type(editorSelector, 'http://localhost:3000/ahttps://meowni.ca');
      await expect(innerHtml(editorSelector)).resolves.not.toInclude('</a>');
    });
  });

  describe('Mentions', () => {
    it.skip('should not allow mixing the tags', async () => {
      await page.type(editorSelector, '@#ab');
      await expect(outerHTML(sel(editorSelector, 'a'))).rejects.toThrow();
    });

    describe('@', () => {
      it('should wrap in progress mentions in a-tag decorations', async () => {
        await page.type(editorSelector, 'Hello @jonathan');
        await expect(innerHtml(editorSelector)).resolves.toInclude(
          '<a class="suggestion suggestion-at">@jonathan</a>',
        );
      });

      it('should accept selections onEnter', async () => {
        await page.type(editorSelector, 'hello @ab');
        await page.keyboard.press('Enter');
        await expect(innerHtml(editorSelector)).resolves.toMatchInlineSnapshot(
          `"<p class=\\"\\">hello <a href=\\"/orangefish879\\" role=\\"presentation\\" class=\\"mention\\" data-mention-id=\\"orangefish879\\" contenteditable=\\"false\\">@orangefish879</a> </p>"`,
        );
      });

      it.skip('should still wrap selections when exiting without selections', async () => {
        await page.type(editorSelector, 'hello @ab ');
        await expect(outerHTML(sel(editorSelector, 'a'))).resolves.toMatchInlineSnapshot();
      });
    });
    describe('#', () => {
      it('should wrap in progress mentions in a-tag decorations', async () => {
        await page.type(editorSelector, 'My tag is #Topic');
        await expect(innerHtml(editorSelector)).resolves.toInclude(
          '<a class="suggestion suggestion-hash">#Topic</a>',
        );
      });

      it('should accept selections onEnter', async () => {
        await page.type(editorSelector, 'hello #T');
        await page.keyboard.press('Enter');
        await expect(innerHtml(editorSelector)).resolves.toMatchInlineSnapshot(
          `"<p class=\\"\\">hello <a class=\\"mention\\" data-mention-id=\\"Tags\\" contenteditable=\\"false\\">#Tags</a> </p>"`,
        );
      });

      it.skip('should still wrap selections when exiting without selections', async () => {
        await page.type(editorSelector, 'hello #T ');
        await expect(outerHTML(sel(editorSelector, 'a'))).resolves.toMatchInlineSnapshot();
      });
    });
  });

  describe.skip('Emoji', () => {
    it.todo('should be able to add emoji');
  });
});
