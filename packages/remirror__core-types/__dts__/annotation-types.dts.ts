import type {
  CustomHandler,
  Dynamic,
  GetCustomHandler,
  GetDynamic,
  GetHandler,
  GetStatic,
  Handler,
  Static,
} from '../';

interface MixedOptions {
  /** Unwrapped options are treated as dynamic */
  name: string;
  optionalName?: string;

  /** Define this as a static required option */
  apiKey: Static<string>;
  port?: Static<number | undefined>;

  /** Defined as a handler */
  onChange: Handler<(value: string) => void>;
  onOptionalChange?: Handler<(value?: number) => void>;

  /** Defined as custom so, it's up to me. */
  keyBindings: CustomHandler<Record<string, (event: Event) => boolean>>;
  optionalKeyBindings?: CustomHandler<Record<string, (event: Event) => boolean>>;

  /**
   * Dynamic is optional but can make it obvious.
   * @default []
   */
  reminders?: Dynamic<string[]>;
}

const mixedDynamic: GetDynamic<MixedOptions> = {
  name: 'fried',
  reminders: [],
  optionalName: 'steak',
};
// @ts-expect-error
const failedDynamic: GetDynamic<MixedOptions> = { apiKey: 'fried', reminders: [] };
const failedDynamic1: GetDynamic<MixedOptions> = {
  name: 'fried',
  optionalName: 'steak',
  reminders: [],
  // @ts-expect-error
  port: 100,
};

const mixedStatic: GetStatic<MixedOptions> = { apiKey: 'asd123', port: 100 };
// @ts-expect-error
const failedStatic: GetStatic<MixedOptions> = { apiKey: 'asd123', keyBindings: {} };

const mixedHandler: GetHandler<MixedOptions> = { onChange() {}, onOptionalChange: () => {} };
// @ts-expect-error
const failedHandler: GetHandler<MixedOptions> = { keyBindings: {} };

const mixedCustom: GetCustomHandler<MixedOptions> = {
  keyBindings: { Enter: () => false },
  optionalKeyBindings: {},
};
// @ts-expect-error
const failedCustom: GetCustomHandler<MixedOptions> = { onChange() {} };

// @ts-expect-error
type FailedHandler1 = Handler<object>;
// @ts-expect-error
type FailedHandler3 = Handler<AnyConstructor>;

// type ArrayPath<Type> = false;
// type ArrayPathValue<Type, Path extends ArrayPath<Type>> = false;

// declare function get<Type, Path extends ArrayPath<Type>>(
//   obj: Type,
//   path: Path,
// ): ArrayPathValue<Type, Path>;

// const obj = { a: 'a', b: [1, 2, 3], c: { d: { e: { f: 'Awesome' } } } } as const;

// const a: 'a' = get(obj, ['a']);

// type TupleOf<T, N extends number> = N extends N
//   ? number extends N
//     ? T[]
//     : _TupleOf<T, N, []>
//   : never;
// type _TupleOf<T, N extends number, R extends unknown[]> = R['length'] extends N
//   ? R
//   : _TupleOf<T, N, [T, ...R]>;
// type T1 = TupleOf<string, 3>;

// type T<N extends number> = N extends N ? 'it does!' : 'it does not 😢';
// type B = T<number>;
// type C = number extends number ? true : false;
// type D = 0 | 1 extends 0 | 1 ? true : false;

// type E = [1, 2]['length'] extends 1 ? true : false
