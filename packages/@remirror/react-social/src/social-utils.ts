import { AnyCombinedUnion, getLazyArray, isRemirrorManager, RemirrorManager } from '@remirror/core';
import { SocialPreset } from '@remirror/preset-social';
import type { CreateReactManagerOptions } from '@remirror/react';

import type { CreateSocialManagerOptions, SocialCombinedUnion } from './social-types';

/**
 * Create the args which should be passed to the `useManager` hook or the
 * `createReactManager` function.
 */
export function socialManagerArgs<Combined extends AnyCombinedUnion>(
  combined: Combined[] | (() => Combined[]) | RemirrorManager<Combined | SocialCombinedUnion>,
  options: CreateSocialManagerOptions = {},
): [
  RemirrorManager<Combined | SocialCombinedUnion> | (() => Array<SocialPreset | Combined>),
  CreateReactManagerOptions?,
] {
  const { social, ...rest } = options;

  if (isRemirrorManager<Combined | SocialCombinedUnion>(combined)) {
    return [combined];
  }

  return [
    () => [...getLazyArray(combined), new SocialPreset(social)],
    {
      ...rest,
      extraAttributes: [
        { identifiers: ['mention', 'emoji'], attributes: { role: { default: 'presentation' } } },
        { identifiers: ['mention'], attributes: { href: { default: null } } },
        ...(rest.extraAttributes ?? []),
      ],
    },
  ];
}
