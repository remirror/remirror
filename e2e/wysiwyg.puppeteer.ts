import { Deployment, URLDescriptor } from '@test-fixtures/test-urls';
import { outerHtml } from './helpers';

const editorSelector = '.remirror-editor';

describe('Wysiwyg Editor Snapshots', () => {
  const url = URLDescriptor.wysiwyg[Deployment.Next][1];
  const ssrIdentifier = 'wysiwyg-editor-ssr';
  const domIdentifier = 'wysiwyg-editor-dom';

  beforeEach(async () => {
    await jestPuppeteer.resetPage();
  });

  describe('SSR', () => {
    beforeEach(async () => {
      // Set JavaScript to disabled to mimic server side rendering
      await page.setJavaScriptEnabled(false);
      await page.goto(URLDescriptor.wysiwyg[Deployment.Next][1]);
    });

    it('should pre render the editor', async () => {
      // This test checks that the ProsemirrorEditor exists and contains the expected html
      await expect(outerHtml(editorSelector)).resolves.toBeTruthy();
      await expect(outerHtml(editorSelector)).resolves.toMatchSnapshot();
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
