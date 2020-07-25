import { useMemo } from 'react';

import { AnyCombinedUnion, RemirrorManager } from '@remirror/core';
import { useManager, useRemirror, UseRemirrorType } from '@remirror/react';

import { CreateSocialManagerOptions, SocialCombinedUnion } from '../social-types';
import { socialManagerArgs } from '../social-utils';

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
  combined: Combined[] | (() => Combined[]) | RemirrorManager<Combined | SocialCombinedUnion>,
  options: CreateSocialManagerOptions = {},
): RemirrorManager<SocialCombinedUnion | Combined> {
  const args = useMemo(() => {
    return socialManagerArgs(combined, options);
  }, [combined, options]);

  return useManager(...args);
}

/**
 * A properly typed alternative `useRemirror` hook for the social editor.
 */
export const useSocialRemirror = useRemirror as UseRemirrorType<SocialCombinedUnion>;
