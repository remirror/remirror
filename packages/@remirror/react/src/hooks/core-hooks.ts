import isEqual from 'fast-deep-equal/react';
import { DependencyList, useEffect, useLayoutEffect, useRef, useState } from 'react';
import useEffectOnce from 'react-use/lib/useEffectOnce';
import useSetState from 'react-use/lib/useSetState';
import useUpdateEffect from 'react-use/lib/useUpdateEffect';
import ResizeObserver from 'resize-observer-polyfill';

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
export function usePrevious<Value>(value: Value) {
  const ref = useRef<Value>();
  useEffect(() => void (ref.current = value), [value]);
  return ref.current;
}

export interface DOMRectReadOnlyLike {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly top: number;
  readonly right: number;
  readonly bottom: number;
  readonly left: number;
}

const defaultBounds = { x: 0, y: 0, width: 0, height: 0, top: 0, right: 0, bottom: 0, left: 0 };

/**
 * Provides the measurements for a react element at the point of layout.
 *
 * @remarks
 *
 * Taken from https://codesandbox.io/embed/lp80n9z7v9
 *
 * ```tsx
 * const [bindRef, { height }] = useMeasure()
 *
 * return <div {...bindRef}>Height: {height}</div>
 * ```
 */
export function useMeasure<Ref extends HTMLElement = any>() {
  const ref = useRef<Ref>(null);
  const [bounds, setBounds] = useState<DOMRectReadOnlyLike>(defaultBounds);

  useLayoutEffect(() => {
    const resizeObserver = new ResizeObserver(([entry]) => setBounds(entry.contentRect));

    if (ref.current) {
      resizeObserver.observe(ref.current);
    }

    return () => resizeObserver.disconnect();
  }, []);

  return [{ ref }, bounds] as const;
}

/**
 * The `setState` type for the `useSetState` hook.
 */
export type PartialDispatch<Type extends object> = (
  patch: Partial<Type> | ((prevState: Type) => Partial<Type>),
) => void;

/**
 * A `useEffect` function with a warning the provided dependencies are deeply
 * equal.
 */
const useEffectWithWarning: typeof useEffect =
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
              `The dependencies passed into your useEffect are deeply equal, but an update has been triggered ${unnecessaryChange.current} time(s). Please consider \`useMemo\` to memoize your dependencies to prevent unwanted re-renders.`,
              deps,
            );
          }

          return effect();
        };

        // eslint-disable-next-line react-hooks/exhaustive-deps
        useEffect(wrappedEffect, deps);
      };

export { useEffectWithWarning, useSetState };
