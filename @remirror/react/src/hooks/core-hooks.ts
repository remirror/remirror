import { SetStateAction, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import ResizeObserver from 'resize-observer-polyfill';

import { isFunction, object } from '@remirror/core';

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

export type DispatchWithCallback<Value> = (value: Value, callback?: () => void) => void;

interface UseStateWithCallback {
  <Type = undefined>(): readonly [
    Type | undefined,
    DispatchWithCallback<SetStateAction<Type | undefined>>,
  ];
  <Type>(value: Type): readonly [Type, DispatchWithCallback<SetStateAction<Type>>];
}

/**
 * Enables the use of state with an optional callback parameter in the setState
 * value.
 *
 * @remarks
 *
 * The callback is called once when the state next updates.
 */
export const useStateWithCallback: UseStateWithCallback = <State>(
  initialState?: State | (() => State),
) => {
  const [[state, callback], setState] = useState<[State | undefined, (() => void) | undefined]>([
    isFunction(initialState) ? initialState() : initialState,
    undefined,
  ]);

  useEffect(() => {
    if (callback) {
      callback();
      setState([state, undefined]);
    }
  }, [callback, state]);

  const setStateWithCallback = useCallback(
    (value: SetStateAction<State | undefined>, cb?: () => void) => {
      setState((prevState) => [isFunction(value) ? value(prevState[0]) : value, cb]);
    },
    [setState],
  );

  return [state, setStateWithCallback] as const;
};

export type PartialSetStateAction<State> = Partial<State> | ((prevState: State) => Partial<State>);

/**
 * A replication of the setState from class Components.
 *
 * @remarks
 *
 * It also accepts partial updates to the state object and a callback which
 * runs when the state has updated.
 *
 * It also returns a 3rd argument which resets the state to the original
 * initialState.
 *
 * ```ts
 * const [state, setState, resetState] = useSetState({a: 'initial', b: 'initial'});
 *
 * setState({a: 'A'});
 * log(state); // => { a: 'A', b: 'initial' }
 *
 * setState(prevState => ({b: 'B'}));
 * log(state); // => { a: 'A', b: 'B' }
 *
 * resetState();
 * log(state); // => { a: 'initial', b: 'initial' }
 * ```
 */
export function useSetState<State extends object>(
  initialState: State | (() => State) = object<State>(),
): readonly [
  State,
  DispatchWithCallback<PartialSetStateAction<State>>,
  (callback?: () => void) => void,
] {
  const [state, setStateWithCallback] = useStateWithCallback<State>(
    isFunction(initialState) ? initialState() : initialState,
  );

  const resetState = useCallback(
    (cb?: () => void) => {
      setStateWithCallback(initialState, cb);
    },
    [initialState, setStateWithCallback],
  );

  const setState = useCallback(
    (patch: PartialSetStateAction<State>, cb?: () => void) => {
      setStateWithCallback(
        (prevState: State) => ({
          ...prevState,
          ...(isFunction(patch) ? patch(prevState) : patch),
        }),
        cb,
      );
    },
    [setStateWithCallback],
  );

  return [state, setState, resetState] as const;
}
