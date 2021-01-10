import type { ConditionalPick, LiteralUnion, UnionToIntersection } from 'type-fest';

import type {
  AnyFunction,
  CommandFunction,
  ConditionalReturnPick,
  EditorSchema,
  Flavoring,
  NonChainableCommandFunction,
  ProsemirrorAttributes,
  StringKey,
} from '@remirror/core-types';

import type { CommandShape, GetCommands, GetHelpers } from '../types';
import type {
  AnyExtension,
  AnyMarkExtension,
  AnyNodeExtension,
  AnyPlainExtension,
} from './extension';

export interface ExtensionListProps<ExtensionUnion extends AnyExtension = AnyExtension> {
  /**
   * The extensions property.
   */
  readonly extensions: readonly ExtensionUnion[];
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
 * @template ExtensionUnion - the extensions being used within the editor
 * @template Expanded - auto generated from `ExtensionUnion`. These are the
 * fully expanded extensions with all sub extensions automatically provided. You
 * never need to provide this type as it is automatically calculated.
 */
export type CommandsFromExtensions<
  ExtensionUnion extends AnyExtension,
  Expanded extends AnyExtension = GetExtensions<ExtensionUnion>
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
export type UiCommandNames<ExtensionUnion extends AnyExtension> = StringKey<
  ConditionalPick<
    {
      [P in keyof UnionToIntersection<
        GetDecoratedUiCommands<ExtensionUnion>
      >]: keyof UnionToIntersection<
        GetDecoratedUiCommands<ExtensionUnion>
      >[P] extends '__uiAnnotation'
        ? true
        : false;
    },
    true
  >
>;

export interface ChainedCommandRunProps {
  /**
   * Dispatches the chained commands.
   *
   * @remarks
   *
   * ```ts
   * commands.chain.insertText('hello').run();
   * ```
   */
  run: () => void;
}

export type ChainedIntersection<ExtensionUnion extends AnyExtension> = UnionToIntersection<
  MapToChainedCommand<GetCommands<ExtensionUnion> | GetDecoratedCommands<ExtensionUnion>>
>;

export type ChainedFromExtensions<ExtensionUnion extends AnyExtension> = ChainedCommandRunProps &
  {
    [Command in keyof ChainedIntersection<ExtensionUnion>]: ChainedIntersection<ExtensionUnion>[Command] extends (
      ...args: any[]
    ) => any
      ? (
          ...args: Parameters<ChainedIntersection<ExtensionUnion>[Command]>
        ) => ChainedFromExtensions<ExtensionUnion>
      : never;
  };

/**
 * Utility type for pulling all the command names from a list
 */
export type CommandNames<ExtensionUnion extends AnyExtension> = StringKey<
  CommandsFromExtensions<ExtensionUnion>
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
 * @template ExtensionUnion - the extensions being used within the editor
 * @template Expanded - auto generated from `ExtensionUnion`. These are the
 * fully expanded extensions with all sub extensions automatically provided. You
 * never need to provide this type as it is automatically calculated.
 */
export type HelpersFromExtensions<
  ExtensionUnion extends AnyExtension,
  Expanded extends AnyExtension = GetExtensions<ExtensionUnion>
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
export type HelperNames<ExtensionUnion extends AnyExtension> = StringKey<
  HelpersFromExtensions<ExtensionUnion>
>;

/**
 * Get the extension type and the extension type of all sub extensions.
 *
 * This uses recursive conditional types which are only available in
 * `typescript@4.1` https://github.com/microsoft/TypeScript/pull/40002
 */
export type GetExtensions<ExtensionUnion> =
  // I don't want to pick up `AnyExtension` in the collected union. If the
  // provided extension is `AnyExtension` return `never`. This has the added
  // benefit of making this a distributive conditional type.
  AnyExtension extends ExtensionUnion
    ? AnyExtension
    : // Make sure the extension is valid
    ExtensionUnion extends AnyExtension
    ? // Now create the union of the provided extension and it's recursively
      // calculated nested extensions.
      ExtensionUnion | GetExtensions<ExtensionUnion['~E']>
    : AnyExtension;

/**
 * The type which gets the active methods from the provided extensions.
 */
export type ActiveFromExtensions<ExtensionUnion extends AnyExtension> = Record<
  GetNodeNameUnion<ExtensionUnion> extends never ? string : GetNodeNameUnion<ExtensionUnion>,
  (attrs?: ProsemirrorAttributes) => boolean
> &
  Record<
    GetMarkNameUnion<ExtensionUnion> extends never ? string : GetMarkNameUnion<ExtensionUnion>,
    (attrs?: ProsemirrorAttributes) => boolean
  >;

/**
 * The type which gets the attributes for the provided node or mark. It returns
 * undefined if the node / mark is not active.
 */
export type AttrsFromExtensions<ExtensionUnion extends AnyExtension> = Record<
  GetNodeNameUnion<ExtensionUnion> extends never ? string : GetNodeNameUnion<ExtensionUnion>,
  (attrs?: ProsemirrorAttributes) => ProsemirrorAttributes | undefined
> &
  Record<
    GetMarkNameUnion<ExtensionUnion> extends never ? string : GetMarkNameUnion<ExtensionUnion>,
    (attrs?: ProsemirrorAttributes) => ProsemirrorAttributes | undefined
  >;

/**
 * Get the names of all available extensions.
 */
export type GetNameUnion<
  ExtensionUnion extends AnyExtension
> = GetExtensions<ExtensionUnion>['name'];

/**
 * A utility type for retrieving the name of an extension only when it's a plain
 * extension.
 *
 * @template ExtensionUnion - the extensions being used within the editor
 * @template Expanded - auto generated from `ExtensionUnion`. These are the
 * fully expanded extensions with all sub extensions automatically provided. You
 * never need to provide this type as it is automatically calculated.
 */
export type GetPlainNameUnion<
  ExtensionUnion extends AnyExtension,
  Expanded extends AnyExtension = GetExtensions<ExtensionUnion>
> = Expanded extends AnyPlainExtension ? Expanded['name'] : never;

/**
 * A utility type for retrieving the name of an extension only when it's a mark
 * extension.
 *
 * @template ExtensionUnion - the extensions being used within the editor
 * @template Expanded - auto generated from `ExtensionUnion`. These are the
 * fully expanded extensions with all sub extensions automatically provided. You
 * never need to provide this type as it is automatically calculated.
 */
export type GetMarkNameUnion<
  ExtensionUnion extends AnyExtension,
  Expanded extends AnyExtension = GetExtensions<ExtensionUnion>
> = Expanded extends AnyMarkExtension ? Expanded['name'] : never;

/**
 * A utility type for retrieving the name of an extension only when it's a node
 * extension.
 *
 * @template ExtensionUnion - the extensions being used within the editor
 * @template Expanded - auto generated from `ExtensionUnion`. These are the
 * fully expanded extensions with all sub extensions automatically provided. You
 * never need to provide this type as it is automatically calculated.
 */
export type GetNodeNameUnion<
  ExtensionUnion extends AnyExtension,
  Expanded extends AnyExtension = GetExtensions<ExtensionUnion>
> = Expanded extends AnyNodeExtension ? Expanded['name'] : never;

/**
 * Gets the editor schema from an extension union.
 */
export type GetSchema<ExtensionUnion extends AnyExtension> = EditorSchema<
  LiteralUnion<GetNodeNameUnion<ExtensionUnion>, string>,
  LiteralUnion<GetMarkNameUnion<ExtensionUnion>, string>
>;

declare global {
  namespace Remirror {
    /**
     * A utility type for all the globally available extension names. This is
     * mainly used to provide autocompletion.
     */
    type NameUnion = LiteralUnion<GetNameUnion<AllExtensionUnion>, string>;

    /**
     * A utility type for all the globally available plain extension names. This
     * is mainly used to provide autocompletion.
     */
    type PlainNameUnion = LiteralUnion<GetPlainNameUnion<AllExtensionUnion>, string>;

    /**
     * A utility type for all the globally available node extension names. This
     * is mainly used to provide autocompletion.
     */
    type NodeNameUnion = LiteralUnion<GetNodeNameUnion<AllExtensionUnion>, string>;

    /**
     * A utility type for all the globally available mark extension names. This
     * is mainly used to provide autocompletion.
     */
    type MarkNameUnion = LiteralUnion<GetMarkNameUnion<AllExtensionUnion>, string>;
  }
}
