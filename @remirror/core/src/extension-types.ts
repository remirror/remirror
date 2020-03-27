import { UnionToIntersection } from 'type-fest';

import {
  ActionMethod,
  AnyConstructor,
  AnyFunction,
  EditorSchema,
  Key,
  StringKey,
} from '@remirror/core-types';

import { AnyExtension, AnyMarkExtension, AnyNodeExtension, Extension } from './extension';

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
export type CommandsOfExtension<GExtension> = GExtension extends Extension<
  infer Name,
  any,
  any,
  any,
  any
>
  ? Name
  : never;

/**
 * Utility type for retrieving the helpers provided by an extension.
 */
export type HelpersOfExtension<
  GExtension extends {
    helpers?: any;
  }
> = GExtension['helpers'];

/**
 * Utility type for retrieving the extension data object made available from the
 * extension.
 */
export type DataOfExtension<
  GExtension extends {
    extensionData?: any;
  }
> = GExtension['extensionData'];

/**
 * Utility type for retrieving the prosemirror type of the extension which can be:
 *
 * - `NodeType`
 * - `MarkType`
 * - `never`
 */
export type ProsemirrorTypeOfExtension<GExtension> = GExtension extends Extension<
  any,
  any,
  any,
  any,
  infer Type
>
  ? Type
  : never;

/**
 * Utility type for retrieving the name of an extension.
 */
export type NameOfExtension<GExtension> = GExtension extends Extension<
  infer Name,
  any,
  any,
  any,
  any
>
  ? Name
  : never;

/**
 * A utility type for retrieving the name of an extension only when it's a plain extension.
 */
export type PlainExtensionNames<GExtension> = GExtension extends Extension<
  infer Name,
  any,
  any,
  any
>
  ? Name
  : never;

/**
 * Provides a priority value to the extension which determines the priority.
 *
 * @remarks
 *
 * A lower value for priority means a higher priority. Think of it as an index
 * and position in array except that it can also support negative values.
 */
export interface PrioritizedExtension<GExtension extends AnyExtension = any> {
  /**
   * The instantiated extension
   */
  extension: GExtension;

  /**
   * A priority given to the extension.
   *
   * @remarks
   *
   * A lower number implies an earlier place in the extension list and hence
   * more priority over the extensions that follow.
   *
   * @defaultValue 2
   */
  priority: number;
}

export type FromFlexibleExtension<
  GValue extends FlexibleExtension
> = GValue extends PrioritizedExtension<infer P> ? P : GValue extends AnyExtension ? GValue : never;

/**
 * Either a PrioritizedExtension or the actual Extension.
 *
 * @remarks
 *
 * This is used by the extension manager to allow for a more flexible
 * initialization.
 */
export type FlexibleExtension<GExtension extends AnyExtension = any> =
  | GExtension
  | PrioritizedExtension<GExtension>;

export type FlexibleExtensions<GExtensions extends AnyExtension[] = any[]> = Array<
  FlexibleExtension<GExtensions[number]>
>;

export interface ExtensionListParams {
  /**
   * A list of passed extensions
   */
  extensions: AnyExtension[];
}
export interface ExtensionParams<GExtension extends AnyExtension = any> {
  /**
   * An extension
   */
  extension: GExtension;
}

/**
 * Get the extension from a PrioritizedExtension.
 */
export type InferFlexibleExtension<
  GFlexible extends FlexibleExtension
> = GFlexible extends PrioritizedExtension
  ? GFlexible['extension']
  : GFlexible extends AnyExtension
  ? GFlexible
  : never;

/**
 * Get the extension types from a list of PrioritizedExtensions.
 */
export type InferFlexibleExtensionList<
  GFlexibleList extends FlexibleExtension[]
> = InferFlexibleExtension<GFlexibleList[number]>;

/**
 * A utility type which maps the passed in extension command in an action that is called via
 * `manager.data.actions.commandName()`.
 */
export type MapCommandToAction<GCommands extends Record<string, AnyFunction>> = {
  [P in Key<GCommands>]: ActionMethod<Parameters<GCommands[P]>>;
};

/**
 * Utility type which receives an extension and provides the type of actions it makes available.
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
 * Retrieve the instance type from an ExtensionClass.
 */
export type TypeOfExtensionClass<
  GExtensionClass extends AnyConstructor,
  GExtension extends InstanceType<GExtensionClass> = InstanceType<GExtensionClass>
> = GExtension extends AnyExtension ? GExtension : never;

/**
 * This is a utility type which allows for retrieving the instance types from an array of Extensions.
 *
 * @remarks
 *
 * ```ts
 * const list = [ParagraphExtension, DocExtension, TextExtension, LinkExtension];
 * type ListInstances = TypeOfExtensionClassList<typeof list>;
 * // => (ParagraphExtension, DocExtension, TextExtension, LinkExtension)[]
 * ```
 */
export type TypeOfExtensionClassList<
  GExtensionConstructors extends AnyConstructor[]
> = TypeOfExtensionClass<GExtensionConstructors[number]>;

/**
 * A utility type for retrieving the name of an extension only when it's a mark extension.
 */
export type MarkNames<GExtension extends AnyExtension> = GExtension extends AnyMarkExtension
  ? GExtension['name']
  : never;

/**
 * A utility type for retrieving the name of an extension only when it's a node extension.
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
