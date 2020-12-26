import { renderEditor } from 'jest-remirror';

import { EmojiExtension } from '@remirror/extension-emoji';
import { LinkExtension } from '@remirror/extension-link';
import { MentionExtension } from '@remirror/extension-mention';

import { socialPreset } from '../..';

test('provides the expected extensions', () => {
  const editor = renderEditor(socialPreset({ maxResults: 10 }));

  expect(editor.manager.getExtension(LinkExtension).options.autoLink).toBeTrue();
  expect(editor.manager.getExtension(EmojiExtension).options.maxResults).toBe(10);
  expect(editor.manager.getExtension(MentionExtension).options.matchers).toHaveLength(2);
});
