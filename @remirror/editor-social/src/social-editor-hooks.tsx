import { useEffect, useRef } from 'react';

import {
  AnyCombinedUnion,
  ExtensionPriority,
  isRemirrorManager,
  RemirrorManager,
} from '@remirror/core';
import { AutoLinkExtension } from '@remirror/extension-auto-link';
import { EmojiExtension } from '@remirror/extension-emoji';
import { MentionExtension } from '@remirror/extension-mention';
import { createReactManager } from '@remirror/react';

import { CreateSocialManagerOptions, SocialCombinedUnion } from './social-editor-types';

/**
 * Create a social remirror manager with all the default react presets and
 * required extensions.
 *
 * @remarks
 *
 * This is the recommended way to use the social editor. The remirror manager is
 * a long living piece of functionality that can be used everywhere.
 */
export function createSocialManager<Combined extends AnyCombinedUnion>(
  combined: readonly Combined[],
  options: CreateSocialManagerOptions = {},
  settings?: Remirror.ManagerSettings,
): RemirrorManager<SocialCombinedUnion | Combined> {
  const { atMatcherOptions, tagMatcherOptions } = options;

  const autoLinkExtension = new AutoLinkExtension({
    defaultProtocol: 'https:',
    priority: ExtensionPriority.High,
  });
  const emojiExtension = new EmojiExtension({
    extraAttributes: { role: { default: 'presentation' } },
    priority: ExtensionPriority.High,
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
    priority: ExtensionPriority.High,
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
  managerOrCombined: readonly Combined[] | RemirrorManager<Combined | SocialCombinedUnion>,
  options: CreateSocialManagerOptions = {},
  settings?: Remirror.ManagerSettings,
): RemirrorManager<SocialCombinedUnion | Combined> {
  const manager = useRef(
    isRemirrorManager<Combined | SocialCombinedUnion>(managerOrCombined)
      ? managerOrCombined
      : createSocialManager(managerOrCombined, options, settings),
  ).current;

  useEffect(() => {
    return () => {
      manager.destroy();
    };
  }, [manager]);

  return manager;
}
