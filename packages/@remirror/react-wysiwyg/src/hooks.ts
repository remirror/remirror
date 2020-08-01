import { useEffect, useRef } from 'react';

import { AnyCombinedUnion, isRemirrorManager, RemirrorManager } from '@remirror/core';
import { useRemirror, UseRemirrorType } from '@remirror/react';

import type { CreateWysiwygManagerOptions, WysiwygCombinedUnion } from './wysiwyg-types';
import { createWysiwygManager } from './wysiwyg-utils';

/**
 * A wrapper around the `createWysiwygManager` function for creating a manager
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
export function useWysiwygManager<Combined extends AnyCombinedUnion>(
  managerOrCombined: readonly Combined[] | RemirrorManager<Combined | WysiwygCombinedUnion>,
  options: CreateWysiwygManagerOptions = {},
): RemirrorManager<WysiwygCombinedUnion | Combined> {
  const manager = useRef(
    isRemirrorManager<Combined | WysiwygCombinedUnion>(managerOrCombined)
      ? managerOrCombined
      : createWysiwygManager(managerOrCombined, options),
  ).current;

  useEffect(() => {
    return () => {
      manager.destroy();
    };
  }, [manager]);

  return manager;
}

/**
 * A properly typed alternative `useRemirror` hook for the wysiwyg editor.
 */
export const useWysiwygRemirror = useRemirror as UseRemirrorType<WysiwygCombinedUnion>;
