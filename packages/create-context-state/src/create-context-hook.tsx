import { get as getPath } from '@ngard/tiny-get';
import pick from 'object.pick';
import { ComponentType, Context as ReactContext, createContext, FC, useContext } from 'react';
import usePrevious from 'use-previous';

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
  return (pathOrSelector?: unknown, equalityCheck?: EqualityChecker<Context>) => {
    const context = useContext(DefaultContext);
    const previousContext = usePrevious(context);

    if (!context) {
      throw new Error(
        '`useContextHook` must be placed inside the `Provider` returned by the `createContextState` method',
      );
    }

    if (!pathOrSelector) {
      return context;
    }

    if (typeof pathOrSelector === 'string') {
      return getPath(context, pathOrSelector);
    }

    if (Array.isArray(pathOrSelector)) {
      return pick(context, pathOrSelector);
    }

    if (typeof pathOrSelector !== 'function') {
      throw new TypeError(
        'invalid arguments passed to `useContextHook`. This hook must be called with zero arguments, a getter function or a path string.',
      );
    }

    const value = pathOrSelector(context);

    if (!previousContext || !equalityCheck) {
      return value;
    }

    const previousValue = pathOrSelector(previousContext);

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
  <Key extends keyof Context>(pickedKeys: Key[]): Pick<Context, Key>;
  <SelectedValue>(
    selector: ContextSelector<Context, SelectedValue>,
    equalityFn?: EqualityChecker<SelectedValue>,
  ): SelectedValue;
  <Path extends GetPath<Context>>(path: Path): PathValue<Context, Path>;
}

export type GetRecursivePath<Type, Key extends keyof Type> = Key extends string
  ? Type[Key] extends Record<string, unknown>
    ?
        | `${Key}.${GetRecursivePath<Type[Key], Exclude<keyof Type[Key], keyof any[]>> & string}`
        | `${Key}.${Exclude<keyof Type[Key], keyof any[]> & string}`
    : never
  : never;
export type GetJoinedPath<Type> = GetRecursivePath<Type, keyof Type> | keyof Type;

export type GetPath<Type> = GetJoinedPath<Type> extends string | keyof Type
  ? GetJoinedPath<Type>
  : keyof Type;

export type PathValue<Type, Path extends GetPath<Type>> = Path extends `${infer Key}.${infer Rest}`
  ? Key extends keyof Type
    ? Rest extends GetPath<Type[Key]>
      ? PathValue<Type[Key], Rest>
      : never
    : never
  : Path extends keyof Type
  ? Type[Path]
  : never;

/**
 * Split but don't allow empty string.
 */
export type Split<
  Input extends string,
  Splitter extends string
> = Input extends `${infer T}${Splitter}${infer Rest}`
  ? '' extends T
    ? [...Split<Rest, Splitter>]
    : [T, ...Split<Rest, Splitter>]
  : [Input];

export type SplitEmpty<
  Input extends string,
  Splitter extends string
> = Input extends `${infer T}${Splitter}${infer Rest}` ? [T, ...Split<Rest, Splitter>] : [Input];

// type A = Split<'a-b-c-s-d', '-'>;

// declare function trial<Type, Path extends GetPath<Type>>(
//   value: Type,
//   path: Path,
// ): PathValue<Type, Path>;
// const a = { list: ['a', 'b', 'c'], name: 'asdf', nested: { a: 'a', b: 'b' } };
// const c = ['a', 'b', 'c', { a: 1 }] as const;
// const b = trial(a, 'asdfasdf');

// type B = keyof string;

// type C = string[];
// type D = C extends Record<string, any> ? C[number] : false;
// type E = keyof string;

type UpperCaseCharacters =
  | 'A'
  | 'B'
  | 'C'
  | 'D'
  | 'E'
  | 'F'
  | 'G'
  | 'H'
  | 'I'
  | 'J'
  | 'K'
  | 'L'
  | 'M'
  | 'N'
  | 'O'
  | 'P'
  | 'Q'
  | 'R'
  | 'S'
  | 'T'
  | 'U'
  | 'V'
  | 'W'
  | 'X'
  | 'Y'
  | 'Z';
export type ValidHookName<Name extends string> = Name extends `use${infer Rest}`
  ? Rest extends StartsWithUpperCase<Rest>
    ? Name
    : never
  : never;
export type StartsWithUpperCase<
  Name extends string
> = Name extends `${UpperCaseCharacters}${infer Rest}` ? Name : never;
