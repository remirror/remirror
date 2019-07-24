import { EDITOR_CLASS_SELECTOR } from '@remirror/core';
import { outerHtml } from './helpers';
import { prefixBrowserName } from './helpers/test-environment';

describe('Wysiwyg Editor Snapshots', () => {
  const url = __SERVER__.urls.wysiwyg.content;
  const ssrIdentifier = prefixBrowserName('wysiwyg', 'editor', 'ssr');
  const domIdentifier = prefixBrowserName('wysiwyg', 'editor', 'dom');

  describe('SSR', () => {
    beforeEach(async () => {
      await page.setJavaScriptEnabled(false);
      await page.goto(url);
    });

    it('should pre render the editor', async () => {
      await expect(outerHtml(EDITOR_CLASS_SELECTOR)).resolves.toBeTruthy();
      await expect(outerHtml(EDITOR_CLASS_SELECTOR)).resolves.toMatchInlineSnapshot(`
              "<div role=\\"textbox\\" aria-multiline=\\"true\\" aria-label=\\"\\" aria-placeholder=\\"Start typing...\\" class=\\"Prosemirror remirror-editor\\" contenteditable=\\"true\\"><h1>A WYSIWYG Editor</h1><p><br></p><p>With <strong><em>formatting </em></strong>and other <u>enhancements</u>.</p><p><br></p><pre class=\\"language-markdown\\"><code><span class=\\"token title important\\"><span class=\\"token punctuation\\">##</span> Simple Code Blocks</span>

              <span class=\\"token code\\"><span class=\\"token punctuation\\">\`\`\`</span><span class=\\"token code-language\\">js</span>
              <span class=\\"token code-block language-js\\">console<span class=\\"token punctuation\\">.</span><span class=\\"token function\\">log</span><span class=\\"token punctuation\\">(</span><span class=\\"token string\\">\\"with code fence support\\"</span><span class=\\"token punctuation\\">)</span><span class=\\"token punctuation\\">;</span></span>
              <span class=\\"token punctuation\\">\`\`\`</span></span>

              <span class=\\"token code\\"><span class=\\"token punctuation\\">\`\`\`</span><span class=\\"token code-language\\">bash</span>
              <span class=\\"token code-block language-bash\\"><span class=\\"token builtin class-name\\">echo</span> <span class=\\"token string\\">\\"fun times\\"</span></span>
              <span class=\\"token punctuation\\">\`\`\`</span></span>

              Use Shift-Enter or Mod-Enter to hard break out of the code block</code></pre><p><br></p><ul><li><p>List support</p><ul><li><p>With nesting</p></li></ul></li><li><p>Built in.</p></li></ul><p><br></p><blockquote><p>Block quotes</p><h3>With support for headers</h3></blockquote><p><br></p><p>And <a href=\\"https://google.com\\" rel=\\"noopener noreferrer nofollow\\">urls</a> with support for <code>Cmd-k</code> shortcut to enter a link manually.</p><p><br></p><p><br></p></div>"
            `);
    });

    it('should match its own snapshot', async () => {
      const image = await page.screenshot();
      expect(image).toMatchImageSnapshot({ customSnapshotIdentifier: ssrIdentifier });
    });

    it('should match the dom image snapshot', async () => {
      const image = await page.screenshot();
      expect(image).toMatchImageSnapshot({ customSnapshotIdentifier: domIdentifier });
    });
  });

  describe('DOM', () => {
    beforeEach(async () => {
      await page.goto(url);
    });

    it('should match its own snapshot', async () => {
      const image = await page.screenshot();
      expect(image).toMatchImageSnapshot({ customSnapshotIdentifier: domIdentifier });
    });

    it('should match the ssr image snapshot', async () => {
      const image = await page.screenshot();
      expect(image).toMatchImageSnapshot({ customSnapshotIdentifier: ssrIdentifier });
    });
  });
});
