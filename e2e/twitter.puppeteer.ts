import { Deployment, URLDescriptor } from '@test-fixtures/test-urls';
import { innerHtml, outerHtml, sel, textContent } from './helpers';

const editorSelector = '.remirror-editor';

describe('SSR Twitter Showcase', () => {
  beforeEach(async () => {
    await jestPuppeteer.resetPage();
    // Set JavaScript to disabled to mimic server side rendering
    await page.setJavaScriptEnabled(false);
    await page.goto(URLDescriptor.twitter[Deployment.Next][1]);
  });

  it('should pre render the editor', async () => {
    // This test checks that the ProsemirrorEditor exists and contains the expected html
    await expect(outerHtml(editorSelector)).resolves.toBeTruthy();
    await expect(outerHtml(editorSelector)).resolves.toMatchInlineSnapshot(
      `"<div role=\\"textbox\\" aria-multiline=\\"true\\" aria-label=\\"\\" class=\\"remirror-editor\\" data-testid=\\"editor-twitter\\"><p class=\\"is-empty\\" data-placeholder=\\"What's happening?\\"></p></div>"`,
    );
  });
});

describe.each(URLDescriptor.twitter)('%s: Twitter Showcase', (_, path) => {
  beforeEach(async () => {
    await jestPuppeteer.resetPage();
    await page.goto(path);
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
      await page.type(editorSelector, '@#ab #@simple ');
      await expect(outerHtml(sel(editorSelector, 'a'))).rejects.toThrow();
    });

    describe('@', () => {
      it('should wrap in progress mentions in a-tag decorations', async () => {
        await page.type(editorSelector, 'Hello @jonathan');
        await expect(textContent(sel(editorSelector, '.suggestion-at'))).resolves.toBe('@jonathan');
      });

      it('should accept selections onEnter', async () => {
        const selector = sel(editorSelector, '.mention-at');

        await page.type(editorSelector, 'hello @ab');
        await page.keyboard.press('Enter');
        await expect(page.$$(selector)).resolves.toHaveLength(1);
        await expect(textContent(selector)).resolves.toBe('@orangefish879'); // This might change if data changes
      });

      it('should still wrap selections when exiting without selections', async () => {
        await page.type(editorSelector, 'hello @ab ');
        await expect(textContent(sel(editorSelector, '.mention-at'))).resolves.toBe('@ab');
      });

      it('allows clicking on suggestions', async () => {
        const selector = '.suggestions-item.active';
        await page.type(editorSelector, 'hello @alex');
        await page.click(selector);
        await expect(textContent(sel(editorSelector, '.mention-at'))).resolves.toBe('@lazymeercat594');
        await expect(textContent(editorSelector)).resolves.toBe('hello @lazymeercat594 ');
      });
    });

    describe('#', () => {
      it('should wrap in progress mentions in a-tag decorations', async () => {
        await page.type(editorSelector, 'My tag is #Topic');
        await expect(textContent(sel(editorSelector, '.suggestion-tag'))).resolves.toBe('#Topic');
      });

      it('should accept selections onEnter', async () => {
        const selector = sel(editorSelector, '.mention-tag');

        await page.type(editorSelector, 'hello #T');
        await page.keyboard.press('Enter');
        await expect(page.$$(selector)).resolves.toHaveLength(1);
        await expect(textContent(selector)).resolves.toBe('#Tags');
      });

      it('should still wrap selections when exiting without selections', async () => {
        await page.type(editorSelector, 'hello #T ');
        await expect(textContent(sel(editorSelector, '.mention-tag'))).resolves.toBe('#T');
      });

      it('allows clicking on suggestions', async () => {
        const selector = '.suggestions-item.active';
        await page.type(editorSelector, 'My #T');
        await page.click(selector);
        await expect(textContent(sel(editorSelector, '.mention-tag'))).resolves.toBe('#Tags');
        await expect(textContent(editorSelector)).resolves.toBe('My #Tags ');
      });
    });
  });

  describe('Emoji', () => {
    it('should be able to add emoji', async () => {
      await page.type(editorSelector, '😀');
      await expect(innerHtml(sel(editorSelector, 'span[title=grinning]'))).resolves.toBeTruthy();
      await expect(innerHtml(sel(editorSelector, 'span[data-emoji-native=😀]'))).resolves.toBeTruthy();
    });

    it('should handle multiple emoji with no spaces', async () => {
      const msg = '123abcXYZ';
      await page.type(editorSelector, '😀😀😀😀');
      await page.keyboard.press('ArrowLeft', { delay: 100 });
      await page.keyboard.press('ArrowLeft', { delay: 100 });
      await page.keyboard.press('ArrowRight', { delay: 100 });
      await page.keyboard.type(msg);
      await expect(innerHtml(sel(editorSelector))).resolves.toInclude(msg);
    });
  });

  // TODO Fix Emoji Tests
  describe('Combined', () => {
    it('should combine mentions emoji and links', async () => {
      // TODO fiddle with the order of this - for some reason when the mention is the last item it fails in the test but not when I'm playing with it
      await page.type(editorSelector, '#awesome hello @ab 😀 google.com');
      await page.keyboard.press('Enter');
      await expect(textContent(sel(editorSelector, '.mention-at'))).resolves.toBe('@ab');
      await expect(textContent(sel(editorSelector, '.mention-tag'))).resolves.toBe('#awesome');
      await expect(innerHtml(sel(editorSelector, 'span[title=grinning]'))).resolves.toBeTruthy();
    });

    it('should not replace emoji with link when no space between', async () => {
      await page.type(editorSelector, '😀google.com');
      await page.keyboard.press('Enter');
      await expect(innerHtml(sel(editorSelector, 'span[title=grinning]'))).resolves.toBeTruthy();
      // Using include since decorations can inject a space here affecting the text
      await expect(textContent(sel(editorSelector, '[href]'))).resolves.toInclude('google.com');
    });
  });
});
