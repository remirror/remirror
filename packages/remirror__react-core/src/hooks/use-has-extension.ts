import { useMemo } from 'react';
import { AnyExtensionConstructor } from '@remirror/core';

import { useRemirrorContext } from './use-remirror-context';

/**
 * Assert if an extension is present in the manager by providing its constructor
 */
export function useHasExtension<Type extends AnyExtensionConstructor>(Constructor: Type): boolean {
  const { hasExtension } = useRemirrorContext();
  return useMemo(() => hasExtension(Constructor), [Constructor, hasExtension]);
}
