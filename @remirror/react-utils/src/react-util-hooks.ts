import { useEffect } from 'react';

/**
 * React hook that delays invoking a function until after wait milliseconds have elapsed
 * since the last time the debounced function was invoked.
 *
 * The third argument is the array of values that the debounce depends on, in the same
 * manner as useEffect. The debounce timeout will start when one of the values changes.
 */
export const useDebounce = <GReturn>(fn: () => GReturn, ms: number = 0, args: any[] = []) => {
  useEffect(() => {
    const handle = setTimeout(fn.bind(null, args), ms);

    return () => {
      // if args change then clear timeout
      clearTimeout(handle);
    };
  }, args);
};
