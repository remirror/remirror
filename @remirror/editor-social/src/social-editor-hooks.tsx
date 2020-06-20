import { useRef } from 'react';
import { Except } from 'type-fest';

import { AnyCombinedUnion, EditorManager } from '@remirror/core';
import { AutoLinkExtension } from '@remirror/extension-auto-link';
import { EmojiExtension } from '@remirror/extension-emoji';
import { MentionExtension, MentionExtensionMatcher } from '@remirror/extension-mention';
import { createReactManager } from '@remirror/react';

import { SocialCombinedUnion } from './social-editor-types';

export interface CreateSocialManagerOptions {
  /**
   * The matcher options for the `@` mention character.
   */
  atMatcherOptions?: Except<MentionExtensionMatcher, 'name' | 'char'>;

  /**
   * The matcher options for the `#` mention character/
   */
  tagMatcherOptions?: Except<MentionExtensionMatcher, 'name' | 'char'>;
}

/**
 * Create a social remirror manager with all the default react presets and
 * extensions.
 *
 * @remarks
 *
 * This is the recommended way to use the social editor. The remirror manager is
 * a long living piece of functionality that can be used everywhere.
 */
export function createSocialManager<Combined extends AnyCombinedUnion>(
  combined: Combined[],
  options: CreateSocialManagerOptions = {},
  settings?: Remirror.ManagerSettings,
): EditorManager<SocialCombinedUnion | Combined> {
  const { atMatcherOptions, tagMatcherOptions } = options;

  const autoLinkExtension = new AutoLinkExtension({ defaultProtocol: 'https:' });
  const emojiExtension = new EmojiExtension({
    extraAttributes: { role: { default: 'presentation' } },
  });
  const mentionExtension = new MentionExtension({
    matchers: [
      { name: 'at', char: '@', appendText: ' ', ...atMatcherOptions },
      { name: 'tag', char: '#', appendText: ' ', ...tagMatcherOptions },
    ],
    extraAttributes: {
      href: { default: null },
      role: 'presentation',
    },
  });

  return createReactManager(
    [...combined, autoLinkExtension, emojiExtension, mentionExtension],
    settings,
  );
}

/**
 * A wrapper around the `createSocialManager` function for creating a manager
 * within a react context.
 *
 * @remarks
 *
 * This can be useful if you want the manager to respond to take in
 * configuration from props.
 *
 * Please note that at the moment the manager returned is a ref. This means that
 * it won't be updated for the lifetime of the component. It takes an initial
 * configuration and then ignores everything else.
 */
export function useSocialManager<Combined extends AnyCombinedUnion>(
  combined: Combined[],
  options: CreateSocialManagerOptions = {},
  settings?: Remirror.ManagerSettings,
): EditorManager<SocialCombinedUnion | Combined> {
  return useRef(createSocialManager(combined, options, settings)).current;
}
