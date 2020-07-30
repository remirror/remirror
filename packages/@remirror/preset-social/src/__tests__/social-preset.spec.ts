import { renderEditor } from 'jest-remirror';

import { ExtensionPriority } from '@remirror/core';
import { AutoLinkExtension } from '@remirror/extension-auto-link';
import { EmojiExtension } from '@remirror/extension-emoji';
import { MentionExtension } from '@remirror/extension-mention';
import { isPresetValid } from '@remirror/testing';

import { SocialPreset } from '..';

test('is valid', () => {
  expect(isPresetValid(SocialPreset, { matchers: [] }));
});

test('can override extensions', () => {
  const autoLinkExtension = new AutoLinkExtension({ defaultProtocol: 'https:' });
  const mentionExtension = new MentionExtension({ matchers: [] });
  const emojiExtension = new EmojiExtension({ priority: ExtensionPriority.Low });
  const socialPreset = new SocialPreset();
  const { manager } = renderEditor([
    autoLinkExtension,
    mentionExtension,
    emojiExtension,
    socialPreset,
  ]);

  expect(manager.getExtension(AutoLinkExtension)).toBe(autoLinkExtension);
  expect(manager.getExtension(MentionExtension)).toBe(mentionExtension);
  expect(manager.getExtension(EmojiExtension)).not.toBe(emojiExtension);
  expect(manager.getExtension(EmojiExtension)).toBe(socialPreset.getExtension(EmojiExtension));
});
