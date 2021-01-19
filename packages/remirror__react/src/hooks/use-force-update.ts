import { useCallback, useState } from 'react';
import { object } from '@remirror/core';

/**
 * Returning a new object reference guarantees that a before-and-after
 * equivalence check will always be false, resulting in a re-render, even when
 * multiple calls to forceUpdate are batched.
 *
 * @internal
 */
export function useForceUpdate(): () => void {
  const [, setState] = useState(object());

  return useCallback((): void => {
    setState(object());
  }, []);
}
