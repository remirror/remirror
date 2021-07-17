import type { ExtensionPriority } from '@remirror/core-constants';
import { Cast } from '@remirror/core-helpers';
import type {
  CustomHandlerKeyList,
  EmptyShape,
  GetCustomHandler,
  GetHandler,
  GetStatic,
  HandlerKeyList,
  IfEmpty,
  IfHasRequiredProperties,
  Shape,
  StaticKeyList,
  Writeable,
} from '@remirror/core-types';

import type { AnyExtensionConstructor, DefaultExtensionOptions, ExtensionConstructor } from './';
import type { HandlerKeyOptions } from './base-class';

interface DefaultOptionsProps<Options extends Shape = EmptyShape> {
  /**
   * The default options.
   *
   * All non required options must have a default value provided.
   *
   * Please note that as mentioned in this issue
   * [#624](https://github.com/remirror/remirror/issues/624), partial options
   * can cause trouble when setting a default.
   *
   * If you need to accept `undefined `as an acceptable default option there are
   * two possible ways to resolve this.
   *
   * #### Use `AcceptUndefined`
   *
   * This is the preferred solution and should be used instead of the following
   * `null` union.
   *
   * ```ts
   * import { AcceptUndefined } from 'remirror';
   *
   * interface Options {
   *   optional?: AcceptUndefined<string>;
   * }
   * ```
   *
   * Now when the options are consumed by this decorator there should be no
   * errors when setting the value to `undefined`.
   *
   * #### `null` union
   *
   * If you don't mind using nulls in your code then this might appeal to you.
   *
   * ```ts
   * interface Options {
   *   optional?: string | null;
   * }
   * ```
   *
   * @default {}
   */
  defaultOptions: DefaultExtensionOptions<Options>;
}

interface DefaultPriorityProps {
  /**
   * The default priority for this extension.
   *
   * @default {}
   */
  defaultPriority?: ExtensionPriority;
}

interface StaticKeysProps<Options extends Shape = EmptyShape> {
  /**
   * The list of all keys which are static and can only be set at the start.
   */
  staticKeys: StaticKeyList<Options>;
}

/**
 * This notifies the extension which options are handlers. Handlers typically
 * represent event handlers that are called in response to something happening.
 *
 * An `onChange` option could be a handler. When designing the API I had to
 * consider that often times, you might want to listen to a handler in several
 * places.
 *
 * A limitation of the static and dynamic options is that there is only one
 * value per extension. So if there is a `minValue` option and that min value
 * option is set in the extension then it becomes the value for all consumers of
 * the  extension. Handlers don't have the same expected behaviour. It is
 * generally expected that you should be able to subscribe to an event in
 * multiple places.
 *
 * In order to make this possible with `remirror` the handlers are automatically
 * created based on the handler keys you provide. Each handler is an array and
 * when the handler is called with `this.options.onChange`, each item in the
 * array is called based on the rules provided.
 */
interface HandlerKeysProps<Options extends Shape = EmptyShape> {
  /**
   * The list of the option names which are event handlers.
   */
  handlerKeys: HandlerKeyList<Options>;

  /**
   * Customize how the handler should work.
   *
   * This allows you to decide how the handlers will be composed together.
   * Currently it only support function handlers, but you can tell the extension
   * to exit early when a certain return value is received.
   *
   * ```ts
   * const handlerOptions = { onChange: { earlyReturnValue: true }};
   * ```
   *
   * The above setting means that onChange will exit early as soon as one of the
   * methods returns true.
   */
  handlerKeyOptions?: MappedHandlerKeyOptions<Options>;
}

type MappedHandlerKeyOptions<Options extends Shape = EmptyShape> = {
  [Key in keyof GetHandler<Options>]?: HandlerKeyOptions<
    ReturnType<GetHandler<Options>[Key]>,
    Parameters<GetHandler<Options>[Key]>
  >;
} & { __ALL__?: HandlerKeyOptions };

interface CustomHandlerKeysProps<Options extends Shape = EmptyShape> {
  customHandlerKeys: CustomHandlerKeyList<Options>;
}

export type ExtensionDecoratorOptions<Options extends Shape = EmptyShape> = DefaultPriorityProps &
  IfHasRequiredProperties<
    DefaultExtensionOptions<Options>,
    DefaultOptionsProps<Options>,
    Partial<DefaultOptionsProps<Options>>
  > &
  IfEmpty<GetStatic<Options>, Partial<StaticKeysProps<Options>>, StaticKeysProps<Options>> &
  IfEmpty<GetHandler<Options>, Partial<HandlerKeysProps<Options>>, HandlerKeysProps<Options>> &
  IfEmpty<
    GetCustomHandler<Options>,
    Partial<CustomHandlerKeysProps<Options>>,
    CustomHandlerKeysProps<Options>
  > &
  Partial<Remirror.StaticExtensionOptions>;

/**
 * A decorator for the remirror extension.
 *
 * This adds static properties to the extension constructor.
 */
export function extension<Options extends Shape = EmptyShape>(
  options: ExtensionDecoratorOptions<Options>,
) {
  return <Type extends AnyExtensionConstructor>(ReadonlyConstructor: Type): Type => {
    const {
      defaultOptions,
      customHandlerKeys,
      handlerKeys,
      staticKeys,
      defaultPriority,
      handlerKeyOptions,
      ...rest
    } = options;

    const Constructor = Cast<Writeable<ExtensionConstructor<Options>> & Shape>(ReadonlyConstructor);

    if (defaultOptions) {
      Constructor.defaultOptions = defaultOptions;
    }

    if (defaultPriority) {
      Constructor.defaultPriority = defaultPriority;
    }

    if (handlerKeyOptions) {
      Constructor.handlerKeyOptions = handlerKeyOptions;
    }

    Constructor.staticKeys = (staticKeys as string[]) ?? [];
    Constructor.handlerKeys = (handlerKeys as string[]) ?? [];
    Constructor.customHandlerKeys = (customHandlerKeys as string[]) ?? [];

    for (const [key, value] of Object.entries(rest as Shape)) {
      if (Constructor[key]) {
        continue;
      }

      Constructor[key] = value;
    }

    return Cast<Type>(Constructor);
  };
}

/**
 * @deprecated use `extension` instead.
 */
export const extensionDecorator = extension;
