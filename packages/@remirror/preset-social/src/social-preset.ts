import type { Except } from 'type-fest';

import type { GetStaticAndDynamic, Static } from '@remirror/core';
import { EmojiExtension, EmojiOptions } from '@remirror/extension-emoji';
import { LinkExtension, LinkOptions } from '@remirror/extension-link';
import {
  MentionExtension,
  MentionExtensionMatcher,
  MentionOptions,
} from '@remirror/extension-mention';

export interface SocialOptions
  extends Except<EmojiOptions, 'onChange'>,
    Partial<MentionOptions>,
    LinkOptions {
  onChangeEmoji?: EmojiOptions['onChange'];

  /**
   * The matcher options for the `@` mention character.
   */
  atMatcherOptions?: Static<Except<MentionExtensionMatcher, 'name' | 'char'>>;

  /**
   * The matcher options for the `#` mention character/
   */
  tagMatcherOptions?: Static<Except<MentionExtensionMatcher, 'name' | 'char'>>;
}

export function socialPreset(options: GetStaticAndDynamic<SocialOptions> = {}): SocialPreset[] {
  options = {
    ...MentionExtension.defaultOptions,
    ...EmojiExtension.defaultOptions,
    matchers: [],
    atMatcherOptions: {},
    tagMatcherOptions: {},

    ...options,
  };

  const { defaultEmoji, maxResults, suggestionCharacter, autoLinkRegex } = options;
  const emojiExtension = new EmojiExtension({
    defaultEmoji,
    maxResults,
    suggestionCharacter,
    extraAttributes: { role: { default: 'presentation' } },
  });

  const {
    matchers,
    appendText,
    mentionTag,
    disableDecorations,
    suggestTag,
    atMatcherOptions,
    tagMatcherOptions,
  } = options;
  const mentionExtension = new MentionExtension({
    matchers: [
      ...(matchers ?? []),
      { name: 'at', char: '@', appendText: ' ', ...atMatcherOptions },
      { name: 'tag', char: '#', appendText: ' ', ...tagMatcherOptions },
    ],
    appendText,
    mentionTag,
    disableDecorations,
    suggestTag,
    extraAttributes: {
      href: { default: null },
      role: 'presentation',
    },
  });
  const linkExtension = new LinkExtension({ autoLink: true, autoLinkRegex });

  return [emojiExtension, mentionExtension, linkExtension];
}

export type SocialPreset = EmojiExtension | MentionExtension | LinkExtension;
