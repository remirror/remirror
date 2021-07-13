import { getDocument, queries } from 'playwright-testing-library';
import { ElementHandle } from 'playwright-testing-library/dist/typedefs';
import {
  goto,
  mod,
  press,
  pressKeyWithModifier,
  selectAll,
  smokeTest,
  ssrTest,
  textContent,
} from 'testing/playwright';

const { getByRole } = queries;
const path = 'editor/wysiwyg';

smokeTest(path);
ssrTest('wysiwyg without content', path);
ssrTest('wysiwyg with content', 'editor/wysiwyg/content');

describe('Wysiwyg Showcase', () => {
  let $document: ElementHandle;
  let $editor: ElementHandle;

  beforeEach(async () => {
    await goto(path);
    $document = await getDocument(page);
    $editor = await getByRole($document, 'textbox');
  });

  it('can accept typed content', async () => {
    const expected = 'Second phrase.';
    await $editor.type('First phrase.');
    await selectAll();
    await page.keyboard.press('Delete');
    await $editor.type(expected);
    await expect($editor).toMatch(expected);
  });

  describe('codeBlock', () => {
    const text = '// This is amazing';
    const mdBlock = '##Markdown is great\n\nReally it is!\n\n```ts\nconst a = "party time"\n```\n';

    it('creates a code block with ``` and space', async () => {
      await $editor.type(`\`\`\`ts ${text}`);
      await expect($editor).toHaveText('pre.language-ts > code', text);
    });

    it('creates a code block with ``` and enter', async () => {
      await $editor.type('```ts');
      await press({ key: 'Enter' });
      await $editor.type(text);
      await expect($editor).toHaveText('pre.language-ts > code', text);
    });

    it('deletes code without issue', async () => {
      await $editor.type(`\`\`\`md ${mdBlock}\nabcde`);
      await press({ key: 'Backspace', count: 5 });
      await $editor.type(text);
      await expect($editor).toHaveText('pre.language-md > code', text);
    });

    it('supports the keyboard shortcut for exiting the block', async () => {
      await $editor.type(`\`\`\`md ${mdBlock}`);
      await pressKeyWithModifier('Shift-Enter');
      await $editor.type('My paragraph');
      await expect($editor).toHaveText('p', 'My paragraph');
    });

    const unformatted = `function concatAwesome(str:    string){return "Awesome " + str}`;
    const formatted = `function concatAwesome(str: string) {\n  return 'Awesome ' + str;\n}\n`;

    it('supports formatting', async () => {
      await $editor.type(`\`\`\`ts ${unformatted}`);
      await pressKeyWithModifier(mod('ShiftAlt', 'KeyF'));
      await expect(textContent('pre.language-ts > code')).resolves.toBe(formatted);
    });

    it('preserves position while formatting', async () => {
      await $editor.type(`\`\`\`ts ${unformatted}`);
      await press({ key: 'ArrowLeft', count: 9 });
      await pressKeyWithModifier(mod('ShiftAlt', 'KeyF'));
      await $editor.type(' World');
      await expect(textContent('pre.language-ts > code')).resolves.toBe(
        `function concatAwesome(str: string) {\n  return 'Awesome World ' + str;\n}\n`,
      );
    });

    it('preserves selection while formatting', async () => {
      await $editor.type(`\`\`\`ts ${unformatted}`);

      // TODO create a utility for selecting text
      await press({ key: 'ArrowLeft', count: 16 });
      await page.keyboard.down('Shift');
      await press({ key: 'ArrowRight', count: 7 });
      await page.keyboard.up('Shift');

      await pressKeyWithModifier(mod('ShiftAlt', 'KeyF'));
      await $editor.type('Oops');

      await expect(textContent('pre.language-ts > code')).resolves.toBe(
        `function concatAwesome(str: string) {\n  return 'Oops ' + str;\n}\n`,
      );
    });

    it('can immediately leave the code area with arrow key', async () => {
      await $editor.type(`\`\`\`ts ${unformatted}`);
      await press({ key: 'ArrowRight' });
      await $editor.type('Outside of the codeblock');
      await expect($editor).toHaveText('p', 'Outside of the codeblock');
    });

    it('can interact with shift enter #218', async () => {
      const expected = 'This text should be displayed';
      await $editor.type('Hello:');
      await pressKeyWithModifier(mod('Shift', 'Enter'));
      await $editor.type('```');
      await pressKeyWithModifier(mod('Shift', 'Enter'));
      await $editor.type('amazing test');
      await pressKeyWithModifier(mod('Shift', 'Enter'));
      await $editor.type('```');
      await press({ key: 'ArrowUp', count: 2 });
      await $editor.type(expected);
      await expect($editor).toMatch(expected);
    });

    it('supports the tab key #266', async () => {
      const input = 'console.log("awesome");';
      await $editor.type(`\`\`\`ts function() {`);
      await press({ key: 'Enter' });
      await press({ key: 'Tab' });
      await $editor.type(input);
      await expect(textContent('pre.language-ts > code')).resolves.toMatchInlineSnapshot(`
              "function() {
              \tconsole.log(\\"awesome\\");"
            `);
    });
  });

  describe('bold', () => {
    it('makes content bold with keyboard shortcut', async () => {
      await $editor.type('make me bold');
      await selectAll();
      await pressKeyWithModifier(mod('Primary', 'b'));
      await expect($editor).toHaveText('strong', 'make me bold');
    });

    it('keeps bold after the shortcut', async () => {
      await $editor.type('hello ');
      await pressKeyWithModifier(mod('Primary', 'b'));
      await $editor.type('friend');
      await expect($editor).toHaveText('strong', 'friend');
    });
  });

  describe('top menu', () => {
    it.todo('top menu tests');
  });

  describe('floating menu', () => {
    it.todo('floating menu tests');
  });
});
