import { useEffect, useLayoutEffect, useRef, useState } from 'react';
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
