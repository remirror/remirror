import isEqual from 'fast-deep-equal/react';
import {
  DependencyList,
  RefObject,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import useEffectOnce from 'react-use/lib/useEffectOnce';
import useSetState from 'react-use/lib/useSetState';
import useUpdateEffect from 'react-use/lib/useUpdateEffect';
import ResizeObserver from 'resize-observer-polyfill';

import { object } from '@remirror/core';

/**
 * Returning a new object reference guarantees that a before-and-after
 * equivalence check will always be false, resulting in a re-render, even when
 * multiple calls to forceUpdate are batched.
 */
export function useForceUpdate(): () => void {
  const [, setState] = useState(object());

  const forceUpdate = useCallback((): void => {
    setState(object());
  }, []);

  return forceUpdate;
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

export type UseMeasureReturn<Ref extends HTMLElement = HTMLElement> = readonly [
  { readonly ref: RefObject<Ref> },
  DOMRectReadOnlyLike,
];

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
export function useMeasure<Ref extends HTMLElement = HTMLElement>(): UseMeasureReturn<Ref> {
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
 * A `useEffect` function which issues a warning when the dependencies provided
 * are deeply equal, but only in development.
 *
 * This is used in places where it's important for developers to memoize and
 * wrap methods with `useCallback`.
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
              `The dependencies passed into your useEffect are deeply equal, but an update has been triggered ${unnecessaryChange.current} time(s). Please consider wrapping the values with \`useMemo\` or \`useCallback\` to memoize your dependencies and prevent unnecessary re-renders.`,
              deps,
            );
          }

          return effect();
        };

        // eslint-disable-next-line react-hooks/exhaustive-deps
        useEffect(wrappedEffect, deps);
      };

export { useEffectWithWarning, useSetState };
