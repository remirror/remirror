import {
  Custom,
  Dynamic,
  GetCustom,
  GetDynamic,
  GetHandler,
  GetStatic,
  Handler,
  Static,
} from '../annotation-types';

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
  keyBindings: Custom<Record<string, (event: Event) => boolean>>;
  optionalKeyBindings?: Custom<Record<string, (event: Event) => boolean>>;

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

const mixedCustom: GetCustom<MixedOptions> = {
  keyBindings: { Enter: () => false },
  optionalKeyBindings: {},
};
// @ts-expect-error
const failedCustom: GetCustom<MixedOptions> = { onChange() {} };

// @ts-expect-error
type FailedHandler1 = Handler<object>;
// @ts-expect-error
type FailedHandler3 = Handler<AnyConstructor>;

// // @ts-expect-error
// type FailedHandler2 = Handler<() => number>;
