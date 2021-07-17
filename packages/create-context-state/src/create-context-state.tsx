/* eslint-disable @typescript-eslint/ban-types */
import { Dispatch, MutableRefObject, useEffect, useRef, useState } from 'react';

import { ContextSelector, createContextHook, CreateContextReturn } from './create-context-hook';

/**
 * Create a context and provider with built in setters and getters.
 *
 * ```tsx
 * import { createContextState } from 'create-context-state';
 *
 * interface Context {
 *   count: number;
 *   increment: () => void;
 *   decrement: () => void;
 *   reset: () => void;
 * }
 *
 * interface Props {
 *   defaultCount: number;
 * }
 *
 * const [CountProvider, useCount] = createContextState<Context, Props>(({ set, props }) => ({
 *   count: previousContext?.count ?? props.defaultCount,
 *   increment: () => set((state) => ({ count: state.count + 1 })),
 *   decrement: () => set((state) => ({ count: state.count - 1 })),
 *   reset: () => set({ count: props.defaultCount }),
 * }));
 *
 * const App = () => {
 *   return (
 *     <CountProvider>
 *       <Counter />
 *     </CountProvider>
 *   );
 * };
 *
 * const Counter = () => {
 *   const { count, increment, decrement, reset } = useCount();
 *
 *   return (
 *     <>
 *       <h1>{count}</h1>
 *       <button onClick={() => increment()}>+</button>
 *       <button onClick={() => decrement()}>-</button>
 *       <button onClick={() => reset()}>reset</button>
 *     </>
 *   );
 * };
 * ```
 *
 * @template Context - The type of the context that is returned from the
 * `useContext` hook.
 * @template Props - The optional props that are passed through to the
 * `Provider`.
 * @template State - Additional state which can be captured via hooks.
 *
 * @param creator - A function used to create the desired context.
 * @param hook - An optional hook which can be used to provide additional state
 * to use in the creator function. Using hooks which rely on context will
 * constrain the returned `Provider` function to only be used in scenarios where
 * the the context is available. Make sure to memoize any exotic values (objects
 * and arrays) returned from the hook or your code will infinitely render.
 */
export function createContextState<Context extends object, Props extends object = object>(
  creator: ContextCreator<Context, Props, undefined>,
): CreateContextReturn<Context, Props>;
export function createContextState<Context extends object, Props extends object, State>(
  creator: ContextCreator<Context, Props, State>,
  hook: NamedHook<Props, State>,
): CreateContextReturn<Context, Props>;
export function createContextState<
  Context extends object,
  Props extends object = object,
  State = undefined,
>(
  creator: ContextCreator<Context, Props, State>,
  hook?: NamedHook<Props, State>,
): CreateContextReturn<Context, Props> {
  return createContextHook<Context, Props>((props) => {
    // Keep a ref to the context so that the `get` function can always be called
    // with the latest value.
    const contextRef = useRef<Context | null>(null);
    const setContextRef = useRef<Dispatch<React.SetStateAction<Context>>>();
    const state = hook?.(props) as State;

    const [context, setContext] = useState(() => {
      return creator({
        get: createGet(contextRef),
        set: createSet(setContextRef),
        previousContext: undefined,
        props,
        state,
      });
    });

    const dependencies = [...Object.values(props), state];

    // Update the context whenever the props are updated. This is only ever
    // called when props are updated.
    useEffect(() => {
      // Don't update if no props or hooks are defined for this hook creator.
      if (dependencies.length === 0) {
        return;
      }

      setContext((previousContext) => {
        return creator({
          get: createGet(contextRef),
          set: createSet(setContextRef),
          previousContext,
          props,
          state,
        });
      });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, dependencies);

    // Keep the refs updated on each render.
    contextRef.current = context;
    setContextRef.current = setContext;

    return context;
  });
}

/**
 * Create a get function which is used to get the current state within the
 * `context` creator.
 */
function createGet<Context extends object>(
  ref: MutableRefObject<Context | null>,
): GetContext<Context> {
  return (pathOrSelector?: unknown) => {
    if (!ref.current) {
      throw new Error(
        '`get` called outside of function scope. `get` can only be called within a function.',
      );
    }

    if (!pathOrSelector) {
      return ref.current;
    }

    if (typeof pathOrSelector !== 'function') {
      throw new TypeError(
        'Invalid arguments passed to `useContextHook`. The hook must be called with zero arguments, a getter function or a path string.',
      );
    }

    return pathOrSelector(ref.current);
  };
}

/**
 * Create a `set` function which is used to set the context.
 */
function createSet<Context extends object>(
  ref: MutableRefObject<Dispatch<React.SetStateAction<Context>> | undefined>,
): SetContext<Context> {
  return (partial) => {
    if (!ref.current) {
      throw new Error(
        '`set` called outside of function scope. `set` can only be called within a function.',
      );
    }

    ref.current((context) => ({
      ...context,
      ...(typeof partial === 'function' ? partial(context) : partial),
    }));
  };
}

export interface GetContext<Context extends object> {
  (): Context;
  <SelectedValue>(selector: ContextSelector<Context, SelectedValue>): SelectedValue;
}
export type PartialContext<Context extends object> =
  | Partial<Context>
  | ((context: Context) => Partial<Context>);
export type SetContext<Context extends object> = (partial: PartialContext<Context>) => void;
/**
 * Get the signature for the named hooks.
 */
export type NamedHook<Props extends object, State> = (props: Props) => State;

export interface ContextCreatorHelpers<
  Context extends object,
  Props extends object,
  State = undefined,
> {
  /**
   * Get the context with a partial update.
   */
  get: GetContext<Context>;

  /**
   * Set the context with a partial update.
   */
  set: SetContext<Context>;

  /**
   * The latest value for the provided props.
   */
  props: Props;

  /**
   * The previous value for the generated context. This is `undefined` when
   * first rendered.
   */
  previousContext: Context | undefined;

  /**
   * The state provided by the custom hook.
   */
  state: State;
}

export type ContextCreator<Context extends object, Props extends object, State> = (
  helpers: ContextCreatorHelpers<Context, Props, State>,
) => Context;
