import { UnionToIntersection } from 'type-fest';

import { AnyFunction, CommandMethod, EditorSchema, StringKey } from '@remirror/core-types';

import {
  AnyExtension,
  AnyMarkExtension,
  AnyNodeExtension,
  AnyPlainExtension,
} from './extension-base';

/**
 * Get the static extension settings.
 */
export type GetSettings<
  Type extends {
    settings: unknown;
  }
> = Type['settings'];

/**
 * Get the dynamic extension properties.
 */
export type GetProperties<
  Type extends {
    properties: unknown;
  }
> = Type['properties'];

/**
 * Get the commands provided by an extension.
 */
export type GetCommands<Type extends { _C: unknown }> = Type['_C'];

/**
 * Get the helpers provided by an extension.
 */
export type GetHelpers<Type extends { _H: unknown }> = Type['_H'];

/**
 * Get the name of an extension.
 */
export type GetName<Type extends { name: string }> = Type['name'];

/**
 * Get the constructor of an extension.
 */
export type GetConstructor<Type extends { constructor: unknown }> = Type['constructor'];

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

export interface ExtensionsParameter<ExtensionUnion extends AnyExtension = any> {
  /**
   * The extensions property.
   */
  readonly extensions: readonly ExtensionUnion[];
}

/**
 * A utility type which maps the passed in extension command in an action that
 * is store in the `manager.store.actions.commandName()`.
 */
export type MapCommandToAction<GCommands extends Record<string, AnyFunction>> = {
  [P in keyof GCommands]: CommandMethod<Parameters<GCommands[P]>>;
};

/**
 * Utility type which receives an extension and provides the type of actions it
 * makes available.
 */
export type CommandsFromExtensions<ExtensionUnion extends AnyExtension> = UnionToIntersection<
  MapCommandToAction<GetCommands<ExtensionUnion>>
>;

/**
 * Utility type for pulling all the action names from a list
 */
export type ActionNames<ExtensionUnion extends AnyExtension> = StringKey<
  CommandsFromExtensions<ExtensionUnion>
>;

/**
 * Retrieve the instance type from an ExtensionConstructor.
 */
export type ExtensionFromConstructor<ExtensionConstructor extends { of: AnyFunction }> = ReturnType<
  ExtensionConstructor['of']
>;

/**
 * A utility type for retrieving the name of an extension only when it's a plain
 * extension.
 */
export type GetPlainNames<Type> = Type extends AnyPlainExtension ? GetName<Type> : never;

/**
 * A utility type for retrieving the name of an extension only when it's a mark
 * extension.
 */
export type GetMarkNames<
  ExtensionUnion extends AnyExtension
> = ExtensionUnion extends AnyMarkExtension ? ExtensionUnion['name'] : never;

/**
 * A utility type for retrieving the name of an extension only when it's a node
 * extension.
 */
export type GetNodeNames<
  ExtensionUnion extends AnyExtension
> = ExtensionUnion extends AnyNodeExtension ? ExtensionUnion['name'] : never;

/**
 * Gets the editor schema from an extension union.
 */
export type SchemaFromExtension<ExtensionUnion extends AnyExtension> = EditorSchema<
  GetNodeNames<ExtensionUnion>,
  GetMarkNames<ExtensionUnion>
>;

/**
 * Provides a method for retrieving an extension from an extension holder.
 */
export interface GetExtensionParameter<ExtensionUnion extends AnyExtension> {
  /**
   * Get and extension from the extension holder (either a preset or a manager)
   * that corresponds to the provided `Constructor`.
   *
   * @param Constructor - the extension constructor to find in the editor.
   */
  getExtension: <ExtensionConstructor extends GetConstructor<ExtensionUnion>>(
    Constructor: ExtensionConstructor,
  ) => ExtensionFromConstructor<ExtensionConstructor>;
}
