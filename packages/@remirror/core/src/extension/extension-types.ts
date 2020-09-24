import type { UnionToIntersection } from 'type-fest';

import type { AnyFunction, NonChainableCommandFunction, StringKey } from '@remirror/core-types';

import type { CommandShape, GetCommands, GetHelpers } from '../types';
import type { AnyExtension } from './extension-base';

export interface ExtensionListParameter<ExtensionUnion extends AnyExtension = AnyExtension> {
  /**
   * The extensions property.
   */
  readonly extensions: readonly ExtensionUnion[];
}

/**
 * Get the default unprocessed commands that are provided by the extensions.
 */
export type RawCommandsFromExtensions<ExtensionUnion extends AnyExtension> = UnionToIntersection<
  GetCommands<ExtensionUnion>
>;

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
 */
export type CommandsFromExtensions<ExtensionUnion extends AnyExtension> = UnionToIntersection<
  MapToUnchainedCommand<GetCommands<ExtensionUnion>>
>;

export interface ChainedCommandRunParameter {
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
  MapToChainedCommand<GetCommands<ExtensionUnion>>
>;

export type ChainedFromExtensions<
  ExtensionUnion extends AnyExtension
> = ChainedCommandRunParameter &
  {
    [Command in keyof ChainedIntersection<ExtensionUnion>]: ChainedIntersection<
      ExtensionUnion
    >[Command] extends (...args: any[]) => any
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
 * A utility type which maps the passed in extension helpers to a method called with
 * `manager.data.helpers.helperName()`.
 */
export type MapHelpers<RawHelpers extends Record<string, AnyFunction>> = {
  [Helper in keyof RawHelpers]: RawHelpers[Helper];
};

/**
 * Utility type which receives an extension and provides the type of helpers it makes available.
 */
export type HelpersFromExtensions<ExtensionUnion extends AnyExtension> = UnionToIntersection<
  MapHelpers<GetHelpers<ExtensionUnion>>
>;

/**
 * Utility type for pulling all the action names from a list
 */
export type HelperNames<ExtensionUnion extends AnyExtension> = StringKey<
  HelpersFromExtensions<ExtensionUnion>
>;

/**
 * Get the extensions from any type with an `extensions` property.
 */
export type GetExtensionUnion<Type extends ExtensionListParameter> = Type['extensions'][number];
