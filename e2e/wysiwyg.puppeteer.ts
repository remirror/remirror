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
    await expect(outerHtml(editorSelector)).resolves.toMatchSnapshot();
  });
});
