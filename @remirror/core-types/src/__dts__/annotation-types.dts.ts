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
  name: string;

  /** Define this as a static required option */
  apiKey: Static<string>;

  /** Defined as a handler */
  onChange: Handler<(value: string) => void>;

  /** Defined as custom so, it's up to me. */
  keyBindings: Custom<Record<string, (event: Event) => boolean>>;

  /**
   * Dynamic is optional but can make it obvious.
   * @default []
   */
  reminders?: Dynamic<string[]>;
}

const mixedDynamic: GetDynamic<MixedOptions> = { name: 'fried', reminders: [] };
// @ts-expect-error
const failedDynamic: GetDynamic<MixedOptions> = { apiKey: 'fried', reminders: [] };

const mixedStatic: GetStatic<MixedOptions> = { apiKey: 'asd123' };
// @ts-expect-error
const failedStatic: GetStatic<MixedOptions> = { apiKey: 'asd123', keyBindings: {} };

const mixedHandler: GetHandler<MixedOptions> = { onChange() {} };
// @ts-expect-error
const failedHandler: GetHandler<MixedOptions> = { keyBindings: {} };

const mixedCustom: GetCustom<MixedOptions> = { keyBindings: { Enter: () => false } };
// @ts-expect-error
const failedCustom: GetCustom<MixedOptions> = { onChange() {} };

// @ts-expect-error
type FailedHandler1 = Handler<object>;
// @ts-expect-error
type FailedHandler3 = Handler<AnyConstructor>;

// // @ts-expect-error
// type FailedHandler2 = Handler<() => number>;
