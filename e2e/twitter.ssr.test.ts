import { EDITOR_CLASS_SELECTOR } from '@remirror/core';
import { outerHtml } from './helpers';
import { prefixBrowserName } from './helpers/test-environment';

describe('Twitter Editor Snapshots', () => {
  const url = __SERVER__.urls.twitter.content;

  const ssrIdentifier = prefixBrowserName('twitter', 'editor', 'ssr');
  const domIdentifier = prefixBrowserName('twitter', 'editor', 'dom');

  describe('SSR', () => {
    beforeEach(async () => {
      await page.setJavaScriptEnabled(false);
      await page.goto(url);
    });

    it('should pre render the editor with consistent html', async () => {
      await expect(outerHtml(EDITOR_CLASS_SELECTOR)).resolves.toBeTruthy();
      await expect(outerHtml(EDITOR_CLASS_SELECTOR)).resolves.toMatchInlineSnapshot(
        `"<div role=\\"textbox\\" aria-multiline=\\"true\\" aria-label=\\"\\" aria-placeholder=\\"What's happening?\\" class=\\"Prosemirror remirror-editor\\" data-testid=\\"editor-twitter\\" contenteditable=\\"true\\"><p><a href=\\"/blueladybug185\\" role=\\"presentation\\" class=\\"mention mention-at\\" data-mention-id=\\"blueladybug185\\">@blueladybug185</a> has proven to me most helpful!</p><p>Random.com<!-- --> on the other hand has not.</p><p>Emojis still make me smile <span data-emoji-id=\\"yum\\" data-emoji-colons=\\"\\" data-emoji-native=\\"😋\\" data-emoji-name=\\"Face Savouring Delicious Food\\" data-emoji-skin=\\"\\" data-use-native=\\"false\\" aria-label=\\"Emoji: Face Savouring Delicious Food\\" title=\\"Emoji: Face Savouring Delicious Food\\" class=\\"\\">😋</span><span data-emoji-id=\\"see_no_evil\\" data-emoji-colons=\\"\\" data-emoji-native=\\"🙈\\" data-emoji-name=\\"See-No-Evil Monkey\\" data-emoji-skin=\\"\\" data-use-native=\\"false\\" aria-label=\\"Emoji: See-No-Evil Monkey\\" title=\\"Emoji: See-No-Evil Monkey\\" class=\\"\\">🙈</span> and I'm here for that.</p></div>"`,
      );
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
