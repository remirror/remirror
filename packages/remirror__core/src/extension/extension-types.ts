import type {
  AnyFunction,
  CommandFunction,
  ConditionalPick,
  ConditionalReturnPick,
  EditorSchema,
  Flavoring,
  LiteralUnion,
  NonChainableCommandFunction,
  ProsemirrorAttributes,
  StringKey,
  Transaction,
  UnionToIntersection,
} from '@remirror/core-types';

import type { CommandShape, GetCommands, GetHelpers } from '../types';
import type {
  AnyExtension,
  AnyMarkExtension,
  AnyNodeExtension,
  AnyPlainExtension,
} from './extension';

export interface ExtensionListProps<Extension extends AnyExtension = AnyExtension> {
  /**
   * The extensions property.
   */
  readonly extensions: readonly Extension[];
}

/**
 * A utility type which maps the passed in extension command in an action that
 * is store in the `manager.store.actions.commandName()`.
 */
export type MapToUnchainedCommand<RawCommands extends Record<string, AnyFunction>> = {
  [Command in keyof RawCommands]: CommandShape<Parameters<RawCommands[Command]>>;
};

/**
 * A utility type which maps the chained commands.
 */
export type MapToChainedCommand<RawCommands extends Record<string, AnyFunction>> = {
  [Command in keyof RawCommands]: ReturnType<
    RawCommands[Command]
  > extends NonChainableCommandFunction
    ? void
    : (...args: Parameters<RawCommands[Command]>) => any;
};

/**
 * Utility type which receives an extension and provides the type of actions it
 * makes available.
 *
 * @template Extension - the extensions being used within the editor
 * @template Expanded - auto generated from `Extension`. These are the
 * fully expanded extensions with all sub extensions automatically provided. You
 * never need to provide this type as it is automatically calculated.
 */
export type CommandsFromExtensions<
  Extension extends AnyExtension,
  Expanded extends AnyExtension = GetExtensions<Extension>,
> = UnionToIntersection<
  MapToUnchainedCommand<GetCommands<Expanded> | GetDecoratedCommands<Expanded>>
>;

/**
 * This uses a hack available via conditional types and `Distributive
 * conditional types`. When a conditional is used on a union it distributes the
 * types so that the union can avoid the case where:
 *
 * > access is restricted to members that are common to all types in the union
 *
 * A better explanation is available here
 * https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-8.html#distributive-conditional-types
 */
type GetDecoratedCommands<Type> = Type extends AnyExtension
  ? ConditionalPick<Type, AnyFunction<CommandFunction>>
  : never;

interface UiAnnotation {
  __uiAnnotation?: never;
}
export type UiCommandFunction = CommandFunction & UiAnnotation;

type GetDecoratedUiCommands<Type> = Type extends AnyExtension
  ? ConditionalPick<Type, AnyFunction<UiCommandFunction>>
  : never;

/**
 * Utility type for pulling all the command names from a list.
 *
 * TODO - why doesn't this work.
 */
export type UiCommandNames<Extension extends AnyExtension> = StringKey<
  ConditionalPick<
    {
      [P in keyof UnionToIntersection<
        GetDecoratedUiCommands<Extension>
      >]: keyof UnionToIntersection<GetDecoratedUiCommands<Extension>>[P] extends '__uiAnnotation'
        ? true
        : false;
    },
    true
  >
>;

export interface ChainedCommandProps {
  /**
   * Dispatches the chained commands.
   *
   * ```ts
   * chain.insertText('hello').run();
   * ```
   *
   * This will run all commands in the chain regardless of whether a previous
   * command was not able to be run.
   *
   * If `exitEarly` is set to true the commands will stop running at the first
   * chainable command which doesn't return true.
   */
  run: (options?: { exitEarly?: boolean }) => void;

  /**
   * Applies the updates to the transaction without dispatching the transaction.
   *
   * This can be used to update a transaction without applying the update.
   */
  tr: () => Transaction;

  /**
   * Check to see whether the command chain can be run. Returns true when the
   * command can be run.
   *
   * ```ts
   * if (chain.insertText('hello').enabled()) {
   *   doSomething();
   * }
   * ```
   */
  enabled: () => boolean;
}

export type ChainedIntersection<Extension extends AnyExtension> = UnionToIntersection<
  MapToChainedCommand<GetCommands<Extension> | GetDecoratedCommands<Extension>>
>;

export type ChainedFromExtensions<
  Extension extends AnyExtension,
  Chained extends ChainedIntersection<Extension> = ChainedIntersection<Extension>,
> = _ChainedFromExtensions<Extension, Chained> &
  ((tr: Transaction) => _ChainedFromExtensions<Extension, Chained>);

type _ChainedFromExtensions<
  Extension extends AnyExtension,
  Chained extends ChainedIntersection<Extension> = ChainedIntersection<Extension>,
> = ChainedCommandProps &
  {
    [Command in keyof Chained]: Chained[Command] extends (...args: any[]) => any
      ? (...args: Parameters<Chained[Command]>) => ChainedFromExtensions<Extension>
      : never;
  };

/**
 * Utility type for pulling all the command names from a list
 */
export type CommandNames<Extension extends AnyExtension> = StringKey<
  CommandsFromExtensions<Extension>
>;

/**
 * A utility type which maps the passed in extension helpers to a method called
 * with `manager.data.helpers.helperName()`.
 */
export type MapHelpers<RawHelpers extends Record<string, AnyFunction>> = {
  [Helper in keyof RawHelpers]: RawHelpers[Helper];
};

/**
 * Utility type which receives an extension and provides the type of helpers it
 * makes available.
 *
 * @template Extension - the extensions being used within the editor
 * @template Expanded - auto generated from `Extension`. These are the
 * fully expanded extensions with all sub extensions automatically provided. You
 * never need to provide this type as it is automatically calculated.
 */
export type HelpersFromExtensions<
  Extension extends AnyExtension,
  Expanded extends AnyExtension = GetExtensions<Extension>,
> = UnionToIntersection<MapHelpers<GetHelpers<Expanded> | GetDecoratedHelpers<Expanded>>>;

export type HelperAnnotation = Flavoring<'HelperAnnotation'>;

/**
 * An annotation which marks decorated helper methods for an extension.
 */
export type Helper<Type> = Type extends null | undefined ? Type : Type & HelperAnnotation;

/**
 * Remove the helper annotation.
 */
type RemoveHelper<Type> = Type extends Helper<infer T> ? T : Type;
type RemoveHelpers<Type extends Record<string, AnyFunction>> = {
  [Key in keyof Type]: (...args: Parameters<Type[Key]>) => RemoveHelper<ReturnType<Type[Key]>>;
};

/**
 * A function with a return signature annotated as a helper.
 */
export type HelperFunction<Type extends HelperAnnotation = HelperAnnotation> = AnyFunction<Type>;

type GetDecoratedHelpers<Type> = Type extends object
  ? RemoveHelpers<ConditionalReturnPick<Type, HelperAnnotation>>
  : never;

/**
 * Utility type for pulling all the action names from a list
 */
export type HelperNames<Extension extends AnyExtension> = StringKey<
  HelpersFromExtensions<Extension>
>;

/**
 * Removes [[`AnyExtension`]] from an extension union. This can be used to make
 * typechecking stricter.
 *
 * @template Extension - The union of extensions to remove [[`AnyExtension`]] from.
 */
export type RemoveAny<Extension> =
  // Use this to make the `Extension` a distributive union. It is always a
  // truthy condition.
  Extension extends Extension
    ? // A way of checking if AnyExtension is identical to the current `Extension` within the distributive union.
      AnyExtension extends Extension
      ? never
      : Extension
    : never;

/**
 * Get the extension type and the extension type of all sub extensions.
 *
 * This uses recursive conditional types which are only available in
 * `typescript@4.1` https://github.com/microsoft/TypeScript/pull/40002
 *
 * @template Extension - The union of extensions.
 */
export type GetExtensions<Extension> =
  // I don't want to pick up `AnyExtension` in the collected union. If the
  // provided extension is `AnyExtension` return `never`. This has the added
  // benefit of making this a distributive conditional type.
  AnyExtension extends Extension
    ? AnyExtension
    : // Make sure the extension is valid
    Extension extends AnyExtension
    ? // Now create the union of the provided extension and it's recursively
      // calculated nested extensions.
      Extension | GetExtensions<Extension['~E']>
    : AnyExtension;

/**
 * The type which gets the active methods from the provided extensions.
 */
export type ActiveFromExtensions<Extension extends AnyExtension> = Record<
  GetNodeNameUnion<Extension> extends never ? string : GetNodeNameUnion<Extension>,
  (attrs?: ProsemirrorAttributes) => boolean
> &
  Record<
    GetMarkNameUnion<Extension> extends never ? string : GetMarkNameUnion<Extension>,
    (attrs?: ProsemirrorAttributes) => boolean
  >;

/**
 * The type which gets the attributes for the provided node or mark. It returns
 * undefined if the node / mark is not active.
 */
export type AttrsFromExtensions<Extension extends AnyExtension> = Record<
  GetNodeNameUnion<Extension> extends never ? string : GetNodeNameUnion<Extension>,
  (attrs?: ProsemirrorAttributes) => ProsemirrorAttributes | undefined
> &
  Record<
    GetMarkNameUnion<Extension> extends never ? string : GetMarkNameUnion<Extension>,
    (attrs?: ProsemirrorAttributes) => ProsemirrorAttributes | undefined
  >;

/**
 * Get the names of all available extensions.
 */
export type GetNameUnion<Extension extends AnyExtension> = GetExtensions<Extension>['name'];

/**
 * A utility type for retrieving the name of an extension only when it's a plain
 * extension.
 *
 * @template Extension - the extensions being used within the editor
 * @template Expanded - auto generated from `Extension`. These are the
 * fully expanded extensions with all sub extensions automatically provided. You
 * never need to provide this type as it is automatically calculated.
 */
export type GetPlainNameUnion<
  Extension extends AnyExtension,
  Expanded extends AnyExtension = GetExtensions<Extension>,
> = Expanded extends AnyPlainExtension ? Expanded['name'] : never;

/**
 * A utility type for retrieving the name of an extension only when it's a mark
 * extension.
 *
 * @template Extension - the extensions being used within the editor
 * @template Expanded - auto generated from `Extension`. These are the
 * fully expanded extensions with all sub extensions automatically provided. You
 * never need to provide this type as it is automatically calculated.
 */
export type GetMarkNameUnion<
  Extension extends AnyExtension,
  Expanded extends AnyExtension = GetExtensions<Extension>,
> = Expanded extends AnyMarkExtension ? Expanded['name'] : never;

/**
 * A utility type for retrieving the name of an extension only when it's a node
 * extension.
 *
 * @template Extension - the extensions being used within the editor
 * @template Expanded - auto generated from `Extension`. These are the
 * fully expanded extensions with all sub extensions automatically provided. You
 * never need to provide this type as it is automatically calculated.
 */
export type GetNodeNameUnion<
  Extension extends AnyExtension,
  Expanded extends AnyExtension = GetExtensions<Extension>,
> = Expanded extends AnyNodeExtension ? Expanded['name'] : never;

/**
 * Gets the editor schema from an extension union.
 */
export type GetSchema<Extension extends AnyExtension> = EditorSchema<
  LiteralUnion<GetNodeNameUnion<Extension>, string>,
  LiteralUnion<GetMarkNameUnion<Extension>, string>
>;

declare global {
  namespace Remirror {
    /**
     * A utility type for all the globally available extension names. This is
     * mainly used to provide autocompletion.
     */
    type NameUnion = LiteralUnion<GetNameUnion<Extensions>, string>;

    /**
     * A utility type for all the globally available plain extension names. This
     * is mainly used to provide autocompletion.
     */
    type PlainNameUnion = LiteralUnion<GetPlainNameUnion<Extensions>, string>;

    /**
     * A utility type for all the globally available node extension names. This
     * is mainly used to provide autocompletion.
     */
    type NodeNameUnion = LiteralUnion<GetNodeNameUnion<Extensions>, string>;

    /**
     * A utility type for all the globally available mark extension names. This
     * is mainly used to provide autocompletion.
     */
    type MarkNameUnion = LiteralUnion<GetMarkNameUnion<Extensions>, string>;
  }
}
