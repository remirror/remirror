import { getUrl, prefixBrowserName } from '@test-fixtures/test-urls';
import { describeServer, outerHtml } from './helpers';

const editorSelector = '.remirror-editor';

describe('Wysiwyg Editor Snapshots', () => {
  let url: string;
  const ssrIdentifier = prefixBrowserName('wysiwyg-editor-ssr');
  const domIdentifier = prefixBrowserName('wysiwyg-editor-dom');

  beforeEach(async () => {
    url = getUrl('wysiwyg', 'next');
    await jestPuppeteer.resetPage();
  });

  describeServer(['next'])('SSR', () => {
    beforeEach(async () => {
      // Set JavaScript to disabled to mimic server side rendering
      await page.setJavaScriptEnabled(false);
      await page.goto(url);
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

  describeServer(['next'])('DOM', () => {
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
