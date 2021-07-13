import {
  ComponentType,
  Context as ReactContext,
  createContext,
  FC,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
} from 'react';

/**
 * Create a `Provider` and `useContext` retriever with a custom hook.
 *
 * This can be used to create
 *
 * ```tsx
 * import { useState, useEffect } from 'react';
 * import { createContextHook } from 'create-context-state'
 *
 * interface Props {
 *   defaultCount: number;
 * }
 *
 * interface Context {
 *   count: number;
 *   increment: () => void;
 *   decrement: () => void;
 *   reset: () => void;
 * }
 *
 * const [CountProvider, useCountStore] = createContextHook<Context, Props>((props) => {
 *   const { defaultCount } = props;
 *
 *   const [context, setContext] = useState(() => {
 *     return {
 *       count: defaultCount,
 *       increment: () => setContext(value => ({...previous, count: previous.count + 1 })),
 *       decrement: () => setContext(previous => ({...previous, count: previous.count - 1 })),
 *       reset: () => setContext(previous => ({...previous, count: defaultCount })),
 *     }
 *   });
 *
 *   useEffect(() => {
 *     setContext((previousContext) => ({
 *       ...previousContext,
 *       count: defaultCount,
 *       reset: () => setContext(previous => ({...previous, count: defaultCount })),
 *     }));
 *   }, [defaultCount])
 *
 *   return context;
 * })
 *
 * const App = () => {
 *   return (
 *     <CountProvider defaultCount={100}>
 *       <InnerApp />
 *     </FooProvider>
 *   )
 * }
 *
 * const InnerApp = () => {
 *   const { count, increment, decrement, reset } = useCountStore()
 *
 *   return (
 *     <div>
 *       <h1>{count}</h1>
 *       <button onClick={increment}>+</button>
 *       <button onClick={decrement}>-</button>
 *       <button onClick={reset}>reset</button>
 *     </div>
 *   )
 * }
 * ```
 *
 * @template Context - The type of the context that is returned from the
 * `useContext` hook.
 * @template Props - The optional props that are passed through to the `Provider`.
 */
export function createContextHook<Context extends object, Props extends object = object>(
  useHook: UseHook<Context, Props>,
): CreateContextReturn<Context, Props> {
  const DefaultContext = createContext<Context | null>(null);
  const useHookContext = contextHookFactory(DefaultContext);

  const Provider: FC<Props> = (props) => {
    const context = useHook(props);

    return <DefaultContext.Provider value={context}>{props.children}</DefaultContext.Provider>;
  };

  return [Provider, useHookContext, DefaultContext];
}

export type CreateContextReturn<Context extends object, Props extends object = object> = [
  Provider: ComponentType<Props>,
  hook: ContextHook<Context>,
  DefaultContext: ReactContext<Context | null>,
];

type UseHook<Context extends object, Props extends object = object> = (props: Props) => Context;

export function contextHookFactory<Context extends object>(
  DefaultContext: ReactContext<Context | null>,
): ContextHook<Context> {
  return (selector?: unknown, equalityCheck?: EqualityChecker<Context>) => {
    const context = useContext(DefaultContext);
    const previousContext = usePrevious(context);

    if (!context) {
      throw new Error(
        '`useContextHook` must be placed inside the `Provider` returned by the `createContextState` method',
      );
    }

    if (!selector) {
      return context;
    }

    if (typeof selector !== 'function') {
      throw new TypeError(
        'invalid arguments passed to `useContextHook`. This hook must be called with zero arguments, a getter function or a path string.',
      );
    }

    const value = selector(context);

    if (!previousContext || !equalityCheck) {
      return value;
    }

    const previousValue = selector(previousContext);

    return equalityCheck(previousValue, value) ? previousValue : value;
  };
}

export type ContextSelector<Context extends object, SelectedValue> = (
  state: Context,
) => SelectedValue;
export type EqualityChecker<SelectedValue> = (
  selectedValue: SelectedValue,
  newSelectedValue: unknown,
) => boolean;

export interface ContextHook<Context extends object> {
  (): Context;
  <SelectedValue>(
    selector: ContextSelector<Context, SelectedValue>,
    equalityFn?: EqualityChecker<SelectedValue>,
  ): SelectedValue;
}

/**
 * Split but don't allow empty string.
 */
export type Split<
  Input extends string,
  Splitter extends string,
> = Input extends `${infer T}${Splitter}${infer Rest}`
  ? '' extends T
    ? [...Split<Rest, Splitter>]
    : [T, ...Split<Rest, Splitter>]
  : [Input];

export type SplitEmpty<
  Input extends string,
  Splitter extends string,
> = Input extends `${infer T}${Splitter}${infer Rest}` ? [T, ...Split<Rest, Splitter>] : [Input];

function usePrevious<T>(value: T) {
  const ref = useRef<T>();
  useIsomorphicLayoutEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

export const useIsomorphicLayoutEffect =
  typeof document !== 'undefined' ? useLayoutEffect : useEffect;
