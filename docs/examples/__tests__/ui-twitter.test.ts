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
    it('should not allow mixing the tags', async () => {
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

      it('should still wrap selections when exiting without selections', async () => {
        await page.type(editorSelector, 'hello @ab ');
        await expect(outerHTML(sel(editorSelector, 'a'))).resolves.toMatchInlineSnapshot(
          `"<a href=\\"/ab\\" role=\\"presentation\\" class=\\"mention\\" data-mention-id=\\"ab\\" contenteditable=\\"false\\">@ab</a>"`,
        );
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
          `"<p class=\\"\\">hello <a href=\\"/search?query=Tags\\" role=\\"presentation\\" class=\\"mention\\" data-mention-id=\\"Tags\\" contenteditable=\\"false\\">#Tags</a> </p>"`,
        );
      });

      it('should still wrap selections when exiting without selections', async () => {
        await page.type(editorSelector, 'hello #T ');
        await expect(outerHTML(sel(editorSelector, 'a'))).resolves.toMatchInlineSnapshot(
          `"<a href=\\"/search?query=T\\" role=\\"presentation\\" class=\\"mention\\" data-mention-id=\\"T\\" contenteditable=\\"false\\">#T</a>"`,
        );
      });
    });
  });

  describe('Emoji', () => {
    it('should be able to add emoji', async () => {
      await page.type(editorSelector, '😀');
      await expect(innerHtml(sel(editorSelector, 'span[title=grinning]'))).resolves.toBeTruthy();
    });

    // ! BUG Multiple adjacent nodes (emoji) cause the editor to lose focus when moving between them
    it.skip('should handle multiple emoji with no spaces', async () => {
      const msg = '123abcXYZ';
      await page.type(editorSelector, '😀😀😀😀');
      await page.keyboard.press('ArrowLeft');
      await page.keyboard.press('ArrowLeft');
      await page.keyboard.press('ArrowRight');
      await page.keyboard.type(msg);
      await expect(innerHtml(sel(editorSelector))).resolves.toInclude(msg);
    });
  });

  describe('Combined', () => {
    it('should combine mentions emoji and links', async () => {
      await page.type(editorSelector, 'hello @ab 😀 google.com');
      await page.keyboard.press('Enter');
      await expect(innerHtml(sel(editorSelector))).resolves.toMatchInlineSnapshot(
        `"<p class=\\"\\">hello <a href=\\"/ab\\" role=\\"presentation\\" class=\\"mention\\" data-mention-id=\\"ab\\" contenteditable=\\"false\\">@ab</a> <span id=\\"grinning\\" native=\\"😀\\" name=\\"Grinning Face\\" colons=\\":grinning:\\" skin=\\"null\\" aria-label=\\"\\" title=\\"\\" class=\\"remirror-editor-emoji-node-view css-2545h7-defaultStyle-defaultStyle-dynamicStyle-dynamicStyle-style-style-ReactNodeView-ReactNodeView\\" usenative=\\"false\\" contenteditable=\\"false\\"><span title=\\"grinning\\" class=\\"emoji-mart-emoji\\"><span style=\\"width: 1.1em; height: 1.1em; display: inline-block; background-image: url(&quot;https://unpkg.com/emoji-datasource-twitter@4.0.4/img/twitter/sheets-256/64.png&quot;); background-size: 5200% 5200%; background-position: 58.8235% 47.0588%;\\">&nbsp;</span></span></span> <a href=\\"http://google.com\\" role=\\"presentation\\">google.com</a></p><p><br></p>"`,
      );
    });

    it('should not replace emoji with link when no space between', async () => {
      await page.type(editorSelector, '😀google.com');
      await expect(innerHtml(sel(editorSelector))).resolves.toMatchInlineSnapshot(
        `"<p class=\\"\\"><span id=\\"grinning\\" native=\\"😀\\" name=\\"Grinning Face\\" colons=\\":grinning:\\" skin=\\"null\\" aria-label=\\"\\" title=\\"\\" class=\\"remirror-editor-emoji-node-view css-2545h7-defaultStyle-defaultStyle-dynamicStyle-dynamicStyle-style-style-ReactNodeView-ReactNodeView\\" usenative=\\"false\\" contenteditable=\\"false\\"><span title=\\"grinning\\" class=\\"emoji-mart-emoji\\"><span style=\\"width: 1.1em; height: 1.1em; display: inline-block; background-image: url(&quot;https://unpkg.com/emoji-datasource-twitter@4.0.4/img/twitter/sheets-256/64.png&quot;); background-size: 5200% 5200%; background-position: 58.8235% 47.0588%;\\">&nbsp;</span></span></span><a href=\\"http://google.com\\" role=\\"presentation\\">google.com</a><span>﻿</span><br></p>"`,
      );
    });
  });
});
