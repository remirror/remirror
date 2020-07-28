import { ExtensionPriority } from '@remirror/core-constants';
import { Cast, entries } from '@remirror/core-helpers';
import {
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

import {
  AnyExtensionConstructor,
  DefaultExtensionOptions,
  ExtensionConstructor,
} from './extension';

interface DefaultOptionsParameter<Options extends Shape = EmptyShape> {
  /**
   * The default options.
   *
   * All non required options must have a default value provided.
   *
   * @defaultValue `{}`
   */
  defaultOptions: DefaultExtensionOptions<Options>;

  /**
   * The default priority for this extension.
   *
   * @defaultValue `{}`
   */
  defaultPriority?: ExtensionPriority;
}

interface StaticKeysParameter<Options extends Shape = EmptyShape> {
  /**
   * The list of all keys which are static and can only be set at the start.
   */
  staticKeys: StaticKeyList<Options>;
}

interface HandlerKeysParameter<Options extends Shape = EmptyShape> {
  /**
   * The list of all keys which are event handlers.
   */
  handlerKeys: HandlerKeyList<Options>;
}

interface CustomHandlerKeysParameter<Options extends Shape = EmptyShape> {
  customHandlerKeys: CustomHandlerKeyList<Options>;
}

export type ExtensionDecoratorOptions<Options extends Shape = EmptyShape> = IfHasRequiredProperties<
  DefaultExtensionOptions<Options>,
  DefaultOptionsParameter<Options>,
  Partial<DefaultOptionsParameter<Options>>
> &
  IfEmpty<GetStatic<Options>, Partial<StaticKeysParameter<Options>>, StaticKeysParameter<Options>> &
  IfEmpty<
    GetHandler<Options>,
    Partial<HandlerKeysParameter<Options>>,
    HandlerKeysParameter<Options>
  > &
  IfEmpty<
    GetCustomHandler<Options>,
    Partial<CustomHandlerKeysParameter<Options>>,
    CustomHandlerKeysParameter<Options>
  > &
  Partial<Remirror.StaticExtensionOptions> & { defaultPriority?: ExtensionPriority };

/**
 * A decorator for the remirror extension.
 *
 * This adds the static properties required for the running of the app.
 */
export function extensionDecorator<Options extends Shape = EmptyShape>(
  options: ExtensionDecoratorOptions<Options>,
) {
  return <Type extends AnyExtensionConstructor>(ReadonlyConstructor: Type) => {
    const {
      defaultOptions,
      customHandlerKeys,
      handlerKeys,
      staticKeys,
      defaultPriority,
      ...rest
    } = options;

    const Constructor = Cast<Writeable<ExtensionConstructor<Options>> & Shape>(ReadonlyConstructor);

    if (defaultOptions) {
      Constructor.defaultOptions = defaultOptions;
    }

    if (defaultPriority) {
      Constructor.defaultPriority = defaultPriority;
    }

    Constructor.staticKeys = staticKeys ?? [];
    Constructor.handlerKeys = handlerKeys ?? [];
    Constructor.customHandlerKeys = customHandlerKeys ?? [];

    for (const [key, value] of entries(rest as Shape)) {
      if (Constructor[key]) {
        continue;
      }

      Constructor[key] = value;
    }

    return Cast<Type>(Constructor);
  };
}

declare global {
  namespace Remirror {
    /**
     * An interface for declaring static options for the extension.
     */
    interface StaticExtensionOptions {}
  }
}
