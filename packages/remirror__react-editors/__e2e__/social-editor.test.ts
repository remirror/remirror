import { getDocument, queries } from 'playwright-testing-library';
import { ElementHandle } from 'playwright-testing-library/dist/typedefs';
import { CoreTheme } from 'remirror';
import {
  goto,
  innerHtml,
  outerHtml,
  press,
  sel,
  textContent,
  type,
  typist,
} from 'testing/playwright';

const FIRST_PARAGRAPH_SELECTOR = `.ProseMirror > p:first-child`;

const { getByRole } = queries;
const path = 'social-editor--basic';

describe('Social Editor', () => {
  let $document: ElementHandle;
  let $editor: ElementHandle;

  beforeEach(async () => {
    await goto(path);
    $document = await getDocument(page);
    $editor = await getByRole($document, 'textbox');
    await $editor.focus();
  });

  describe('Links', () => {
    it('should have a social editor', async () => {
      await $editor.focus();
      await typist('This is text https://url.com');
      await expect($editor.innerHTML()).resolves.toMatchSnapshot();
    });

    it('should parse simple urls', async () => {
      await typist('url.com');
      await expect($editor.innerHTML()).resolves.toMatchSnapshot();

      await typist('{backspace}');
      await expect($editor.innerHTML()).resolves.toMatchSnapshot();

      await typist('{backspace}');
      await expect($editor.innerHTML()).resolves.toMatchSnapshot();

      await typist('o.uk');
      await expect($editor.innerHTML()).resolves.toMatchSnapshot();
    });

    it('can handle more complex interactions', async () => {
      await typist('this is the first url.com{enter}this.com is test.com{home}split.com ');
      await expect($editor.innerHTML()).resolves.toMatchSnapshot();

      await typist('{arrowup}{end}{backspace}{backspace}..no .co more url please');

      await expect(innerHtml(FIRST_PARAGRAPH_SELECTOR)).resolves.toBe(
        `this is the first url.c..no .co more url please`,
      );
    });

    it('should handle the enter key', async () => {
      await typist('this is the first url.com{arrowleft}{arrowleft}{arrowleft}{enter}');
      await expect(innerHtml(FIRST_PARAGRAPH_SELECTOR)).resolves.toBe(`this is the first url.`);
    });

    it('should not contain false positives', async () => {
      await typist('https://localhost:3000/ahttps://meowni.ca');
      await expect(innerHtml(FIRST_PARAGRAPH_SELECTOR)).resolves.toBe(
        `https://localhost:3000/ahttps://meowni.ca`,
      );
    });
  });

  describe('Mentions', () => {
    it('should not allow mixing the tags', async () => {
      await typist('@#ab #@simple ');
      await expect(outerHtml('a')).rejects.toThrow();
    });

    describe('@', () => {
      it('should wrap in progress mentions in a-tag decorations', async () => {
        await typist('Hello @jonathan');
        await expect(textContent('.suggest-at')).resolves.toBe('@jonathan');
      });

      it('should not trap the arrow keys', async () => {
        await typist('@a');
        await press({ key: 'ArrowLeft', count: 2 });

        await typist('12 ');
        await expect($editor.innerHTML()).resolves.toMatchSnapshot();
      });

      it('should not revert the mention', async () => {
        await typist('@a {arrowleft} ');
        await expect(textContent('.mention-at')).resolves.toBe('@a');
      });

      it('should accept selections onEnter', async () => {
        const selector = sel(CoreTheme.EDITOR, '.mention-at');

        await typist('hello @ab');
        await press({ key: 'Enter' });
        await expect(page.$$(selector)).resolves.toHaveLength(1);
        await expect(textContent(selector)).resolves.toBe('@orangefish879'); // This might change if data changes
      });

      it('should still wrap selections when exiting without selections', async () => {
        await typist('hello @ab ');
        await expect(textContent(sel(CoreTheme.EDITOR, '.mention-at'))).resolves.toBe('@ab');
      });

      it('allows clicking on suggestions', async () => {
        const selector = '.remirror-mention-suggestions-item.highlighted';
        await typist('hello @alex');

        await page.click(selector);
        await expect(textContent(sel(CoreTheme.EDITOR, '.mention-at'))).resolves.toBe(
          '@lazymeercat594',
        );
        await expect(textContent(CoreTheme.EDITOR)).resolves.toBe(`hello @lazymeercat594 `);
      });

      it('allows arrowing between suggesters', async () => {
        await typist('hello  1');
        await press({ key: 'ArrowLeft', count: 2 });
        await typist('@ab');
        await press({ key: 'ArrowRight' });
        await expect(textContent(sel(CoreTheme.EDITOR, '.mention-at'))).resolves.toBe('@ab');
      });

      it('allows arrowing between suggesters and breaking up the suggestion', async () => {
        await typist('hello  1');
        await press({ key: 'ArrowLeft' });
        await typist('@ab ');
        await expect(textContent(sel(CoreTheme.EDITOR, '.mention-at'))).resolves.toBe('@ab');
      });

      it('handles arrowing between arrowing back into mention without errors', async () => {
        await typist('@ab ');
        await press({ key: 'ArrowLeft', count: 4 });
        await press({ key: 'ArrowRight' });
        await expect(textContent(sel(CoreTheme.EDITOR, '.mention-at'))).resolves.toBe('@ab');
      });

      it('removes mark when no partial query', async () => {
        await typist('@abc ');
        await press({ key: 'ArrowLeft', count: 4 });
        await typist(' ');
        await expect(
          textContent(sel(CoreTheme.EDITOR, '.mention-at')),
        ).rejects.toThrowErrorMatchingInlineSnapshot(
          `"page.$eval: Error: failed to find element matching selector \\".remirror-editor .mention-at\\""`,
        );
      });

      it('adds the mark when enter is pressed', async () => {
        const username = '@abcd1234';
        await typist(username);
        await press({ key: 'Enter' });
        await expect(textContent(sel(CoreTheme.EDITOR, '.mention-at'))).resolves.toBe(username);
      });

      it('splits up the mark when enter is pressed', async () => {
        const username = '@abcd1234 ';
        await typist(username);
        await press({ key: 'ArrowLeft', count: 3 });
        await press({ key: 'Enter' });
        await expect(textContent(sel(CoreTheme.EDITOR, '.mention-at'))).resolves.toBe('@abcd12');
      });

      it('removes mentions for forward deletes', async () => {
        await typist('@abc ');
        await press({ key: 'ArrowLeft', count: 5 });
        await press({ key: 'Delete' });
        await expect(
          textContent(sel(CoreTheme.EDITOR, '.mention-at')),
        ).rejects.toThrowErrorMatchingInlineSnapshot(
          `"page.$eval: Error: failed to find element matching selector \\".remirror-editor .mention-at\\""`,
        );
      });

      it('can exit when selecting text', async () => {
        await typist('@abc ');
        await press({ key: 'ArrowLeft', count: 1 });
        await page.keyboard.down('Shift');
        await press({ key: 'ArrowLeft', count: 4 });
        await page.keyboard.up('Shift');
        await press({ key: 'ArrowLeft', count: 1 });
        await typist('Awesome ');

        await expect(textContent(sel(CoreTheme.EDITOR, '.mention-at'))).resolves.toBe('@abc');
        await expect(textContent(sel(CoreTheme.EDITOR))).resolves.toBe('Awesome @abc ');
      });

      it('only replaces the selected text in a mention', async () => {
        await typist('@abc ');
        await press({ key: 'ArrowLeft', count: 2 });
        await page.keyboard.down('Shift');
        await press({ key: 'ArrowLeft', count: 3 });
        await page.keyboard.up('Shift');
        await typist('d');

        await expect(textContent(sel(CoreTheme.EDITOR))).resolves.toBe('dc ');
      });
    });

    describe('#', () => {
      it('should wrap in progress mentions in a-tag decorations', async () => {
        await typist('My tag is #Topic');
        await expect(textContent(sel(CoreTheme.EDITOR, '.suggest-tag'))).resolves.toBe('#Topic');
      });

      it('should accept selections onEnter', async () => {
        const selector = sel(CoreTheme.EDITOR, '.mention-tag');

        await typist('hello #T');
        await press({ key: 'Enter' });
        await expect(page.$$(selector)).resolves.toHaveLength(1);
        await expect(textContent(selector)).resolves.toBe('#Tags');
      });

      it('should still wrap selections when exiting without selections', async () => {
        await typist('hello #T ');
        await expect(textContent(sel(CoreTheme.EDITOR, '.mention-tag'))).resolves.toBe('#T');
      });

      it('allows clicking on suggesters', async () => {
        const selector = '.remirror-mention-suggestions-item.highlighted';
        await typist('My #T');
        await page.click(selector);
        await expect(textContent(sel(CoreTheme.EDITOR, '.mention-tag'))).resolves.toBe('#Tags');
        await expect(textContent(CoreTheme.EDITOR)).resolves.toBe(`My #Tags `);
      });
    });
  });

  describe('Emoji', () => {
    // Emoji are being completely rewritten soon so this is temporary
    it('should be able to add emoji', async () => {
      await typist('😀', { delay: 10 });
      await expect(innerHtml(sel(CoreTheme.EDITOR, 'p'))).resolves.toBe(`😀`);
    });

    it('transforms emoticons', async () => {
      await typist(':-) hello', { delay: 10 });
      await expect(innerHtml(FIRST_PARAGRAPH_SELECTOR)).resolves.toBe(`😃 hello`);
    });

    it('transforms colon emojis', async () => {
      await typist(':heart:', { delay: 10 });
      await expect(innerHtml(FIRST_PARAGRAPH_SELECTOR)).resolves.toBe(`❤️`);
    });

    it('should handle multiple emoji with no spaces', async () => {
      const text = '123abcXYZ';
      await typist('😀😀😀😀', { delay: 10 });
      await press({ key: 'ArrowLeft', count: 2 });
      await press({ key: 'ArrowRight' });
      await type({ text });
      await expect(textContent(FIRST_PARAGRAPH_SELECTOR)).resolves.toBe(`😀😀😀123abcXYZ😀`);
    });
  });

  describe('Combined Emoji, Mentions and AutoLinks', () => {
    it('should combine mentions emoji and links', async () => {
      await typist('#awesome hello @ab 😀 google.com', { delay: 10 });
      await press({ key: 'Enter' });
      await expect($editor.innerHTML()).resolves.toMatchSnapshot();
    });

    it('should not replace emoji with link when no space between', async () => {
      await typist('😀google.com', { delay: 10 });
      await press({ key: 'Enter' });
      await expect($editor.innerHTML()).resolves.toMatchSnapshot();
    });
  });
});
