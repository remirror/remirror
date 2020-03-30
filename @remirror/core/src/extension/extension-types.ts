import { UnionToIntersection } from 'type-fest';

import {
  ActionMethod,
  AnyConstructor,
  AnyFunction,
  EditorSchema,
  StringKey,
} from '@remirror/core-types';

import {
  AnyExtension,
  AnyMarkExtension,
  AnyNodeExtension,
  AnyPlainExtension,
} from './extension-base';

/**
 * Utility type for retrieving the extension options from an extension.
 */
export type OptionsOfExtension<
  GExtension extends {
    _O: any;
  }
> = GExtension['_O'];

/**
 * Utility type for retrieving the commands provided by an extension.
 */
export type CommandsOfExtension<Type extends { _C: any }> = Type['_C'];

/**
 * Utility type for retrieving the helpers provided by an extension.
 */
export type HelpersOfExtension<Type extends { _H: any }> = Type['_H'];

/**
 * Utility type for retrieving the name of an extension.
 */
export type NameOfExtension<Type extends { name: string }> = Type['name'];

/**
 * A utility type for retrieving the name of an extension only when it's a plain
 * extension.
 */
export type PlainExtensionNames<Type> = Type extends AnyPlainExtension
  ? NameOfExtension<Type>
  : never;

export interface ExtensionListParameter {
  /**
   * A list of passed extensions
   */
  extensions: AnyExtension[];
}

export interface ExtensionParameter<ExtensionUnion extends AnyExtension = any> {
  /**
   * An extension.
   */
  extension: ExtensionUnion;
}

/**
 * A utility type which maps the passed in extension command in an action that
 * is store in the `manager.store.actions.commandName()`.
 */
export type MapCommandToAction<GCommands extends Record<string, AnyFunction>> = {
  [P in keyof GCommands]: ActionMethod<Parameters<GCommands[P]>>;
};

/**
 * Utility type which receives an extension and provides the type of actions it
 * makes available.
 */
export type ActionsFromExtensions<GExtension extends AnyExtension> = UnionToIntersection<
  MapCommandToAction<CommandsOfExtension<GExtension>>
>;

/**
 * Utility type for pulling all the action names from a list
 */
export type ActionNames<GExtension extends AnyExtension> = StringKey<
  ActionsFromExtensions<GExtension>
>;

/**
 * Retrieve the instance type from an ExtensionConstructor.
 */
export type ExtensionFromConstructor<ExtensionConstructor extends { of: AnyFunction }> = ReturnType<
  ExtensionConstructor['of']
>;

/**
 * A utility type for retrieving the name of an extension only when it's a mark
 * extension.
 */
export type MarkNames<GExtension extends AnyExtension> = GExtension extends AnyMarkExtension
  ? GExtension['name']
  : never;

/**
 * A utility type for retrieving the name of an extension only when it's a node
 * extension.
 */
export type NodeNames<GExtension extends AnyExtension> = GExtension extends AnyNodeExtension
  ? GExtension['name']
  : never;

/**
 * Gets the schema from a list of extensions
 */
export type SchemaFromExtensions<GExtension extends AnyExtension = any> = EditorSchema<
  NodeNames<GExtension>,
  MarkNames<GExtension>
>;
