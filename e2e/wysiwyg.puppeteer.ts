import { Deployment, URLDescriptor } from '@test-fixtures/test-urls';
import { outerHtml } from './helpers';

const editorSelector = '.remirror-editor';

describe('SSR Twitter Showcase', () => {
  beforeEach(async () => {
    await jestPuppeteer.resetPage();
    // Set JavaScript to disabled to mimic server side rendering
    await page.setJavaScriptEnabled(false);
    await page.goto(URLDescriptor.wysiwyg[Deployment.Next][1]);
  });

  it('should pre render the editor', async () => {
    // This test checks that the ProsemirrorEditor exists and contains the expected html
    await expect(outerHtml(editorSelector)).resolves.toBeTruthy();
    await expect(outerHtml(editorSelector)).resolves.toMatchInlineSnapshot(`
            "<div role=\\"textbox\\" aria-multiline=\\"true\\" aria-label=\\"\\" class=\\"remirror-editor\\"><h1>A WYSIWYG Editor</h1><p></p><p>With <strong><em>formatting </em></strong>and other <u>enhancements</u>.</p><p></p><pre>Simple Code Blocks
            echo \\"fun times\\"
            Use Shift-Enter or Mod-Enter to hard break out of the code block<code></code></pre><p></p><ul><li><p>List support</p><ul><li><p>With nesting</p></li></ul></li><li><p>Built in.</p></li></ul><p></p><blockquote><p>Block quotes</p><h3>With support for headers</h3></blockquote><p></p><p>And <a href=\\"https://google.com\\" rel=\\"noopener noreferrer nofollow\\">urls</a> with support for <code>Cmd-k</code> shortcut to enter a link manually.</p><p></p><p></p></div>"
          `);
  });
});
