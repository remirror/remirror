import isEqual from 'fast-deep-equal/react';
import { DependencyList, useCallback, useEffect, useRef, useState } from 'react';
import useEffectOnce from 'react-use/lib/useEffectOnce';
import useUpdateEffect from 'react-use/lib/useUpdateEffect';

import { object } from '@remirror/core';

/**
 * Returning a new object reference guarantees that a before-and-after
 * equivalence check will always be false, resulting in a re-render, even when
 * multiple calls to forceUpdate are batched.
 */
export function useForceUpdate(): () => void {
  const [, setState] = useState(object());

  return useCallback((): void => {
    setState(object());
  }, []);
}

/**
 * Preserves the previous version of a provided value.
 *
 * ```tsx
 * const [isOpen, setOpen] = useState<boolean>(false)
 * const previous = usePrevious(isOpen)
 *
 * return <span onClick={() => setOpen(!isOpen)}>{isOpen && previous === isOpen ? 'Stable' : 'Unstable' }</span>
 * ```
 */
export function usePrevious<Value>(value: Value): Value | undefined {
  const ref = useRef<Value>();
  useEffect(() => void (ref.current = value), [value]);
  return ref.current;
}

/**
 * A `useEffect` function which issues a warning when the dependencies provided
 * are deeply equal, but only in development.
 *
 * This is used in places where it's important for developers to memoize and
 * wrap methods with `useCallback`.
 */
export const useEffectWithWarning: typeof useEffect =
  process.env.NODE_ENV === 'production'
    ? useEffect
    : (effect, deps) => {
        const ref = useRef<DependencyList>();
        const unnecessaryChange = useRef(0);

        useEffectOnce(() => {
          ref.current = deps;
        });

        useUpdateEffect(() => {
          if (!isEqual(deps, ref.current)) {
            unnecessaryChange.current = 0;
            ref.current = deps;
            return;
          }

          unnecessaryChange.current += 1;
        });

        const wrappedEffect = () => {
          if (unnecessaryChange.current >= 1) {
            console.warn(
              `The dependencies passed into your useEffect are deeply equal, but an update has been triggered ${unnecessaryChange.current} time(s). Please consider wrapping the values with \`useMemo\` or \`useCallback\` to memoize your dependencies and prevent unnecessary re-renders.`,
              deps,
            );
          }

          return effect();
        };

        // eslint-disable-next-line react-hooks/exhaustive-deps
        useEffect(wrappedEffect, deps);
      };
