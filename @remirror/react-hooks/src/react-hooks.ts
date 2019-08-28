import { isFunction } from '@remirror/core-helpers';
import { Ref, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import ResizeObserver from 'resize-observer-polyfill';

/**
 * Preserves the previous version of provided value.
 *
 * ```tsx
 * const [isOpen, setOpen] = useState<boolean>(false)
 * const previous = usePrevious(isOpen)
 *
 * return <span onClick={() => setOpen(!isOpen)}>{isOpen && previous === isOpen ? 'Stable' : 'Unstable' }</span>
 * ```
 */
export const usePrevious = <GValue>(value: GValue) => {
  const ref = useRef<GValue>();
  useEffect(() => void (ref.current = value), [value]);
  return ref.current;
};

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

/**
 * Provides the measurements for a react element.
 * Taken from https://codesandbox.io/embed/lp80n9z7v9
 *
 * ```tsx
 * const [bindRef, { height }] = useMeasure()
 *
 * return <div {...bindRef}>Height: {height}</div>
 * ```
 */
export const useMeasure = <GRef extends HTMLElement = any>() => {
  const ref = useRef<GRef>(null);
  const [bounds, setBounds] = useState<DOMRectReadOnlyLike>(defaultBounds);

  useLayoutEffect(() => {
    const resizeObserver = new ResizeObserver(([entry]) => setBounds(entry.contentRect));

    if (ref.current) {
      resizeObserver.observe(ref.current);
    }
    return () => resizeObserver.disconnect();
  }, []);

  return [{ ref }, bounds] as const;
};

const defaultBounds = { x: 0, y: 0, width: 0, height: 0, top: 0, right: 0, bottom: 0, left: 0 };

interface RefProps<GRef extends HTMLElement = any> {
  ref?: Ref<GRef>;
}

/**
 * Combines the refs within the passed props into a single ref
 * function.
 *
 * ```tsx
 * const combineRefs = useCombinedRefs<HTMLDivElement>();
 * return <div {...combineRefs(getMenuProps(), { ref }, otherProps)} />
 * ```
 */
export const useCombinedRefs = <GRef extends HTMLElement = any>() => <GProp extends RefProps>(
  ...propsWithRefs: GProp[]
) => {
  const targetRef = useCallback((instance: GRef | null) => {
    propsWithRefs.forEach(props => {
      const { ref } = props;
      if (!ref) {
        return;
      }
      if (isFunction(ref)) {
        ref(instance);
      } else {
        (ref as any).current = instance;
      }
    });
  }, []);
  return propsWithRefs.reduce((acc, props) => {
    return {
      ...acc,
      ...props,
      ref: targetRef,
    };
  }, {});
};
