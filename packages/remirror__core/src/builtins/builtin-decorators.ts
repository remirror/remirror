import type { ExtensionPriority } from '@remirror/core-constants';
import type {
  AnyFunction,
  CommandFunction,
  I18nFormatter,
  KeyBindingCommandFunction,
  Listable,
  LiteralUnion,
  NonChainableCommandFunction,
  ProsemirrorAttributes,
  Shape,
} from '@remirror/core-types';
import type { CoreIcon } from '@remirror/icons';

import type { AnyExtension, HelperAnnotation } from '../extension';
import type { GetOptions } from '../types';

/**
 * A decorator which can be applied to top level methods on an extension to
 * identify them as helpers. This can be used as a replacement for the
 * `createHelpers` method.
 *
 * To allow the TypeScript compiler to automatically infer types, please create
 * your methods with the following type signature.
 *
 * ```ts
 * import { Helper } from '@remirror/core';
 *
 * type Signature = (...args: any[]) => Helper<SomeReturnType>;
 * ```
 *
 * The following is an example of how this can be used within your extension.
 *
 * ```ts
 * import { helper, Helper } from '@remirror/core';
 *
 * class MyExtension {
 *   get name() {
 *     return 'my';
 *   }
 *
 *   @helper()
 *   alwaysTrue(): Helper<boolean> {
 *     return true;
 *   }
 * }
 * ```
 *
 * The above helper can now be used within your editor instance.
 *
 * ```tsx
 * import { useRemirrorContext } from '@remirror/react';
 *
 * const MyEditorButton = () => {
 *   const { helpers } = useRemirrorContext();
 *
 *   return helpers.alwaysTrue() ? <button>My Button</button> : null
 * }
 * ```
 *
 * @category Method Decorator
 */
export function helper(options: HelperDecoratorOptions = {}) {
  return <Extension extends AnyExtension, Type>(
    method: AnyFunction<NonNullable<Type> extends HelperAnnotation ? Type : never>,
    context: ClassMethodDecoratorContext<Extension>,
  ): AnyFunction<NonNullable<Type> extends HelperAnnotation ? Type : never> => {
    const methodName = context.name;

    if (typeof methodName !== 'string') {
      throw new TypeError('Invalid method name provided');
    }

    context.addInitializer(function () {
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const ExtensionClass = this;
      (ExtensionClass.decoratedHelpers ??= {})[methodName] = options;
    });

    return method;
  };
}

/**
 * A legacy decorator (pre Stage 3) which can be applied to top level methods
 * on an extension to identify them as helpers. This can be used as a
 * replacement for the `createHelpers` method.
 *
 * To allow the TypeScript compiler to automatically infer types, please create
 * your methods with the following type signature.
 *
 * ```ts
 * import { Helper } from '@remirror/core';
 *
 * type Signature = (...args: any[]) => Helper<SomeReturnType>;
 * ```
 *
 * The following is an example of how this can be used within your extension.
 *
 * ```ts
 * import { legacyHelper, Helper } from '@remirror/core';
 *
 * class MyExtension {
 *   get name() {
 *     return 'my';
 *   }
 *
 *   @legacyHelper()
 *   alwaysTrue(): Helper<boolean> {
 *     return true;
 *   }
 * }
 * ```
 *
 * The above helper can now be used within your editor instance.
 *
 * ```tsx
 * import { useRemirrorContext } from '@remirror/react';
 *
 * const MyEditorButton = () => {
 *   const { helpers } = useRemirrorContext();
 *
 *   return helpers.alwaysTrue() ? <button>My Button</button> : null
 * }
 * ```
 *
 * @category Method Decorator
 * @deprecated legacy - please use the ES2023 decorator `@helper`
 */
export function legacyHelper(options: HelperDecoratorOptions = {}) {
  return <Extension extends AnyExtension, Type>(
    target: Extension,
    propertyKey: string,
    _descriptor: TypedPropertyDescriptor<
      // This type signature helps enforce the need for the `Helper` annotation
      // while allowing for `null | undefined`.
      AnyFunction<NonNullable<Type> extends HelperAnnotation ? Type : never>
    >,
  ): void => {
    // Attach the options to the `decoratedCommands` property for this extension.
    (target.decoratedHelpers ??= {})[propertyKey] = options;
  };
}

/**
 * A decorator which can be applied to top level methods on an extension to
 * identify them as commands. This can be used as a replacement for the
 * `createCommands` method.
 *
 * If you prefer not to use decorators, then you can continue using
 * `createCommands`. Internally the decorators are being used as they are better
 * for documentation purposes.
 *
 * For automated type inference methods that use this decorator must implement
 * the following type signature.
 *
 * ```ts
 * import { CommandFunction } from '@remirror/core';
 *
 * type Signature = (...args: any[]) => CommandFunction;
 * ```
 *
 * The following is an example of how this can be used within your extension.
 *
 * ```ts
 * import { command, CommandFunction } from '@remirror/core';
 *
 * class MyExtension {
 *   get name() {
 *     return 'my';
 *   }
 *
 *   @command()
 *   myCommand(text: string): CommandFunction {
 *     return ({ tr, dispatch }) => {
 *       dispatch?.(tr.insertText('my command ' + text));
 *       return true;
 *     }
 *   }
 * }
 * ```
 *
 * The above command can now be used within your editor instance.
 *
 * ```tsx
 * import { useRemirrorContext } from '@remirror/react';
 *
 * const MyEditorButton = () => {
 *   const { commands } = useRemirrorContext();
 *
 *   return <button onClick={() => commands.myCommand('hello')}>My Button</button>
 * }
 * ```
 *
 * @category Method Decorator
 */
export function command<Extension extends AnyExtension>(
  options?: ChainableCommandDecoratorOptions<Required<GetOptions<Extension>>>,
): ExtensionDecorator<Extension, CommandFunction, void>;
export function command<Extension extends AnyExtension>(
  options: NonChainableCommandDecoratorOptions<Required<GetOptions<Extension>>>,
): ExtensionDecorator<Extension, NonChainableCommandFunction, void>;
export function command(
  options: CommandDecoratorOptions = {},
): ExtensionDecorator<AnyExtension, any, void> {
  return (method, context) => {
    const methodName = context.name;

    if (typeof methodName !== 'string') {
      throw new TypeError('Invalid method name provided');
    }

    context.addInitializer(function () {
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const ExtensionClass = this;
      (ExtensionClass.decoratedCommands ??= {})[methodName] = options;
    });

    return method;
  };
}

/**
 * A legacy decorator (pre Stage 3) which can be applied to top level methods
 * on an extension to identify them as commands. This can be used as a
 * replacement for the `createCommands` method.
 *
 * If you prefer not to use decorators, then you can continue using
 * `createCommands`. Internally the decorators are being used as they are better
 * for documentation purposes.
 *
 * For automated type inference methods that use this decorator must implement
 * the following type signature.
 *
 * ```ts
 * import { CommandFunction } from '@remirror/core';
 *
 * type Signature = (...args: any[]) => CommandFunction;
 * ```
 *
 * The following is an example of how this can be used within your extension.
 *
 * ```ts
 * import { legacyCommand, CommandFunction } from '@remirror/core';
 *
 * class MyExtension {
 *   get name() {
 *     return 'my';
 *   }
 *
 *   @legacyCommand()
 *   myCommand(text: string): CommandFunction {
 *     return ({ tr, dispatch }) => {
 *       dispatch?.(tr.insertText('my command ' + text));
 *       return true;
 *     }
 *   }
 * }
 * ```
 *
 * The above command can now be used within your editor instance.
 *
 * ```tsx
 * import { useRemirrorContext } from '@remirror/react';
 *
 * const MyEditorButton = () => {
 *   const { commands } = useRemirrorContext();
 *
 *   return <button onClick={() => commands.myCommand('hello')}>My Button</button>
 * }
 * ```
 *
 * @category Method Decorator
 * @deprecated legacy - please use the ES2023 decorator `@command`
 */
export function legacyCommand<Extension extends AnyExtension>(
  options?: ChainableCommandDecoratorOptions<Required<GetOptions<Extension>>>,
): LegacyExtensionDecorator<Extension, CommandFunction, void>;
export function legacyCommand<Extension extends AnyExtension>(
  options: NonChainableCommandDecoratorOptions<Required<GetOptions<Extension>>>,
): LegacyExtensionDecorator<Extension, NonChainableCommandFunction, void>;
export function legacyCommand(options: CommandDecoratorOptions = {}): any {
  return (target: any, propertyKey: string, _descriptor: any): void => {
    // Attach the options to the decoratedCommands property for this extension.
    (target.decoratedCommands ??= {})[propertyKey] = options;
  };
}

/**
 * A decorator which can be applied to an extension method to
 * identify as a key binding method. This can be used as a replacement for
 * the `createKeymap` method depending on your preference.
 *
 * If you prefer not to use decorators, then you can continue using
 * `createKeymap`.
 *
 * @category Method Decorator
 */
export function keyBinding<Extension extends AnyExtension>(
  options: KeybindingDecoratorOptions<Required<GetOptions<Extension>>>,
) {
  return (
    method: KeyBindingCommandFunction,
    context: ClassMethodDecoratorContext<Extension>,
  ): KeyBindingCommandFunction => {
    const methodName = context.name;

    if (typeof methodName !== 'string') {
      throw new TypeError('Invalid method name provided');
    }

    context.addInitializer(function () {
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const ExtensionClass = this;
      (ExtensionClass.decoratedKeybindings ??= {})[methodName] =
        options as KeybindingDecoratorOptions;
    });

    return method;
  };
}

/**
 * A legacy decorator (pre Stage 3) which can be applied to an extension
 * method to identify as a key binding method. This can be used as a
 * replacement for the `createKeymap` method depending on your
 * preference.
 *
 * If you prefer not to use decorators, then you can continue using
 * `createKeymap`.
 *
 * @category Method Decorator
 * @deprecated legacy - please use the ES2023 decorator `@keyBinding`
 */
export function legacyKeyBinding<Extension extends AnyExtension>(
  options: KeybindingDecoratorOptions<Required<GetOptions<Extension>>>,
) {
  return (
    target: Extension,
    propertyKey: string,
    _descriptor: TypedPropertyDescriptor<KeyBindingCommandFunction>,
  ): void => {
    // Attach the options to the decoratedCommands property for this extension.
    (target.decoratedKeybindings ??= {})[propertyKey] = options as any;
  };
}

export interface HelperDecoratorOptions {}

export type KeyboardShortcutFunction<Options extends Shape = Shape> = (
  options: Options,
  store: Remirror.ExtensionStore,
) => KeyboardShortcut;
export type KeyboardShortcutValue = Listable<
  LiteralUnion<
    | 'Enter'
    | 'ArrowDown'
    | 'ArrowUp'
    | 'ArrowLeft'
    | 'ArrowRight'
    | 'Escape'
    | 'Delete'
    | 'Backspace',
    string
  >
>;

export type KeyboardShortcut = KeyboardShortcutValue | KeyboardShortcutFunction;

export interface KeybindingDecoratorOptions<Options extends Shape = Shape> {
  /**
   * The keypress sequence to intercept.
   *
   * - `Enter`
   * - `Shift-Enter`
   */
  shortcut: KeyboardShortcut;

  /**
   * This can be used to set a keybinding as inactive based on the provided
   * options.
   */
  isActive?: (options: Options, store: Remirror.ExtensionStore) => boolean;

  /**
   * The priority for this keybinding.
   */
  priority?:
    | ExtensionPriority
    | ((options: Options, store: Remirror.ExtensionStore) => ExtensionPriority);

  /**
   * The name of the command that the keybinding should be attached to.
   */
  command?: Remirror.AllUiCommandNames;
}

type ExtensionDecorator<Extension extends AnyExtension, Fn, Return> = (
  method: AnyFunction<Fn>,
  context: ClassMethodDecoratorContext<Extension, AnyFunction<Fn>>,
) => Return;

export type LegacyExtensionDecorator<Extension extends AnyExtension, Fn, Return> = (
  target: Extension,
  propertyKey: string,
  _descriptor: TypedPropertyDescriptor<AnyFunction<Fn>>,
) => Return;

export interface CommandUiIcon {
  /**
   * The icon name.
   */
  name: CoreIcon;

  /**
   * Text placed in a superscript position. For `ltr` this is in the top right
   * hand corner of the icon.
   */
  sup?: string;

  /**
   * Text placed in a subscript position. For `ltr` this is in the bottom right
   * hand corner.
   */
  sub?: string;
}

export type CommandDecoratorShortcut =
  | string
  | { shortcut: string; attrs: ProsemirrorAttributes }
  | string[]
  | Array<{ shortcut: string; attrs: ProsemirrorAttributes }>;

export interface CommandUiDecoratorOptions {
  /**
   * The default command icon to use if this has a UI representation.
   */
  icon?: CommandDecoratorValue<CoreIcon | CommandUiIcon>;

  /**
   * A label for the command with support for i18n. This makes use of
   * `babel-plugin-macros` to generate the message.
   */
  label?: CommandDecoratorMessage;

  /**
   * An i18n compatible description which can be used to provide extra context
   * for the command.
   */
  description?: CommandDecoratorMessage;

  /**
   * A keyboard shortcut which can be used to run the specified command.
   *
   * Rather than defining this here, you should create a decorated `keyBinding`
   * and set the `command` name option. This way the shortcut will dynamically
   * be added at runtime.
   */
  shortcut?: CommandDecoratorShortcut;
}

export interface CommandDecoratorMessageProps {
  /**
   * True when the command is enabled.
   */
  enabled: boolean;

  /**
   * True when the extension is active.
   */
  active: boolean;

  /**
   * Predefined attributes which can influence the returned value.
   */
  attrs: ProsemirrorAttributes | undefined;

  /**
   * A translation utility for translating a predefined string / or message
   * descriptor.
   */
  t: I18nFormatter;
}

/**
 * @typeParam Value - the value which should be returned from the function or
 * used directly.
 */
export type CommandDecoratorValue<Value> = ((props: CommandDecoratorMessageProps) => Value) | Value;

export type CommandDecoratorMessage = CommandDecoratorValue<string>;
interface ChainableCommandDecoratorOptions<Options extends Shape>
  extends Remirror.CommandDecoratorOptions<Options> {
  /**
   * Set this to `true` to disable chaining of this command. This means it will
   * no longer be available when running `
   *
   * @defaultValue false
   */
  disableChaining?: false;
}
interface NonChainableCommandDecoratorOptions<Options extends Shape>
  extends Remirror.CommandDecoratorOptions<Options> {
  /**
   * Set this to `true` to disable chaining of this command. This means it will
   * no longer be available when running `
   *
   * @defaultValue false
   */
  disableChaining: true;
}

export type CommandDecoratorOptions<Options extends Shape = Shape> =
  | ChainableCommandDecoratorOptions<Options>
  | NonChainableCommandDecoratorOptions<Options>;

declare global {
  namespace Remirror {
    /**
     * UX options for the command which can be extended.
     */
    interface CommandDecoratorOptions<Options extends Shape = Shape>
      extends CommandUiDecoratorOptions {
      /**
       * A function which can be used to override whether a command is already
       * active for the current selection.
       */
      active?: (options: Options, store: ExtensionStore) => boolean;
    }
  }
}
