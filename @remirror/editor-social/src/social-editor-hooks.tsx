import { useEffect, useRef } from 'react';

import { AnyCombinedUnion, isRemirrorManager, RemirrorManager } from '@remirror/core';
import { SocialPreset } from '@remirror/preset-social';
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
): RemirrorManager<SocialCombinedUnion | Combined> {
  const { social, ...rest } = options;
  const socialPreset = new SocialPreset(social);

  return createReactManager([...combined, socialPreset], {
    ...rest,
    managerSettings: {
      ...rest.managerSettings,
      extraAttributes: [
        { identifiers: ['mention', 'emoji'], attributes: { role: { default: 'presentation' } } },
        { identifiers: ['mention'], attributes: { href: { default: null } } },
        ...(rest.managerSettings?.extraAttributes ?? []),
      ],
    },
  });
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
): RemirrorManager<SocialCombinedUnion | Combined> {
  const manager = useRef(
    isRemirrorManager<Combined | SocialCombinedUnion>(managerOrCombined)
      ? managerOrCombined
      : createSocialManager(managerOrCombined, options),
  ).current;

  useEffect(() => {
    return () => {
      manager.destroy();
    };
  }, [manager]);

  return manager;
}
