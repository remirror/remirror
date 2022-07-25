import { useRef } from 'react';

import { useIsomorphicLayoutEffect } from './use-isomorphic-layout-effect';

export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();
  useIsomorphicLayoutEffect(() => {
    ref.current = value;
  });
  return ref.current;
}
