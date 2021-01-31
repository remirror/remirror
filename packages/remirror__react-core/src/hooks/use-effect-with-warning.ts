import isEqual from 'fast-deep-equal/react';
import { DependencyList, useEffect, useRef } from 'react';
import warning from 'tiny-warning';

/**
 * A `useEffect` function which issues a warning when an update occurs with
 * dependencies which are deeply equal. This only happens `development`. In
 * production it aliases the `useEffect` hook.
 *
 * This is used in places where it's important for developers to memoize and
 * wrap methods with `useCallback`. Failure to do so will result in multiple
 * renders for the exact same content and slow down the editing experience.
 *
 * @internal
 */
export const useEffectWithWarning: typeof useEffect =
  process.env.NODE_ENV === 'production'
    ? useEffect
    : (effect, deps) => {
        const firstUpdate = useRef(true);
        const ref = useRef<DependencyList>();
        const unnecessaryChange = useRef(0);

        useEffect(() => {
          // Use the effect only the first render.
          if (firstUpdate.current) {
            firstUpdate.current = false;

            // Hold the initial reference for the deps.
            ref.current = deps;
            return;
          }

          // Only run the following on every subsequent render.
          if (!isEqual(deps, ref.current)) {
            unnecessaryChange.current = 0;
            ref.current = deps;
            return;
          }

          unnecessaryChange.current += 1;
        });

        const wrappedEffect = () => {
          if (unnecessaryChange.current > 0) {
            // TODO remove this before release
            throw new Error(`SERIOUS ${unnecessaryChange.current}`);
          }

          warning(
            unnecessaryChange.current === 0,
            `The dependencies passed into your useEffect are identical, but an update has been triggered ${unnecessaryChange.current} time(s). Please consider wrapping the values with \`useMemo\` or \`useCallback\` to memoize your dependencies and prevent unnecessary re-renders.`,
          );

          return effect();
        };

        // eslint-disable-next-line react-hooks/exhaustive-deps
        useEffect(wrappedEffect, deps);
      };
