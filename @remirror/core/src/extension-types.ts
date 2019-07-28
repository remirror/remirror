import { Extension } from './extension';
import { MarkExtension } from './mark-extension';
import { NodeExtension } from './node-extension';
import {
  ActionMethod,
  AnyConstructor,
  AnyFunction,
  BaseExtensionOptions,
  EditorSchema,
  ExtensionCommandReturn,
  ExtensionHelperReturn,
  Key,
  StringKey,
  UnionToIntersection,
} from './types';

/**
 * Provides a type annotation which is applicable to any extension type.
 */
export type AnyExtension = Extension<any, any>;

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
export type CommandsOfExtension<
  GExtension extends {
    commands?: any;
  }
> = GExtension['commands'];

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
export type ProsemirrorTypeOfExtension<
  GExtension extends {
    _T: any;
  }
> = GExtension['_T'];

/**
 * Utility type for retrieving the name of an extension.
 */
export type NameOfExtension<GExtension extends AnyExtension> = GExtension['name'];

/**
 * Utility type for retrieving all the names from a list of extensions.
 */
export type NamesInExtensionList<GExtensions extends AnyExtension[]> = NameOfExtension<GExtensions[number]>;

/**
 * A utility type for retrieving the name of an extension only when it's a plain extension.
 */
export type PlainName<GExtension extends AnyExtension> = ProsemirrorTypeOfExtension<GExtension> extends never
  ? GExtension['name']
  : never;

/**
 * Utility type for getting all the plain names from a list of extensions.
 *
 * This is used to define the schema plain types available on the extension manager.
 */
export type PlainNames<GExtensions extends AnyExtension[]> = PlainName<GExtensions[number]>;

/** An extension constructor */
export interface ExtensionConstructor<
  GOptions extends BaseExtensionOptions,
  GExtension extends Extension<GOptions, any>
> {
  // tslint:disable-next-line: callable-types
  new (options?: GOptions): GExtension;
}

/**
 * Provides a priority value to the extension which determines the priority.
 *
 * @remarks
 *
 * A lower value for priority means a higher priority. Think of it as an index
 * and position in array except that it can also support negative values.
 */
export interface PrioritizedExtension<GExtension extends AnyExtension = AnyExtension> {
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

/**
 * Either a PrioritizedExtension or the actual Extension.
 *
 * @remarks
 *
 * This is used by the extension manager to allow for a more flexible
 * initialization.
 */
export type FlexibleExtension<GExtension extends AnyExtension = AnyExtension> =
  | PrioritizedExtension<GExtension>
  | GExtension;
export interface ExtensionListParams {
  /**
   * A list of passed extensions
   */
  extensions: AnyExtension[];
}
export interface ExtensionParams<GExtension extends AnyExtension = AnyExtension> {
  /**
   * An extension
   */
  extension: GExtension;
}

/**
 * Get the extension from a PrioritizedExtension.
 */
export type ExtensionFromFlexible<
  GFlexible extends FlexibleExtension<any>
> = GFlexible extends PrioritizedExtension<any>
  ? GFlexible['extension']
  : GFlexible extends AnyExtension
  ? GFlexible
  : never;

/**
 * Get the extension types from a list of PrioritizedExtensions.
 */
export type ExtensionsFromFlexibleList<
  GFlexibleList extends Array<FlexibleExtension<any>>
> = ExtensionFromFlexible<GFlexibleList[number]>;

/**
 * The type signature of the extension command method. It is used in determining whether
 * or not a command has been defined on the extension in order to infer it's return type.
 */
type ExtensionCommandMethodSignature = (...args: any[]) => ExtensionCommandReturn;

type MapCommandToActionNames<GCommand extends AnyFunction> = StringKey<ReturnType<GCommand>>;

export type ActionNamesFromExtension<
  GExtension extends AnyExtension,
  GCommands extends CommandsOfExtension<GExtension> = CommandsOfExtension<GExtension>
> = GCommands extends AnyFunction ? MapCommandToActionNames<GCommands> : never;

export type ActionNamesFromExtensionList<GExtensions extends AnyExtension[]> = ActionNamesFromExtension<
  GExtensions[number]
>;

/**
 * A utility type which maps the passed in extension command in an action that is called via
 * `manager.data.actions.commandName()`.
 */
type MapCommandToAction<
  GCommand extends AnyFunction,
  GCommandReturn extends ReturnType<GCommand> = ReturnType<GCommand>
> = {
  [P in Key<GCommandReturn>]: ActionMethod<Parameters<GCommandReturn[P]>>;
};

/**
 * Utility type which receives an extension and provides the type of actions it makes available.
 */
export type ActionsFromExtension<
  GExtension extends AnyExtension,
  GCommands extends CommandsOfExtension<GExtension> = CommandsOfExtension<GExtension>
> = GCommands extends ExtensionCommandMethodSignature ? MapCommandToAction<GCommands> : {};

/**
 * Creates an actions intersection object from a list of provided extensions.
 */
export type ActionsFromExtensionList<
  GExtensions extends AnyExtension[],
  GIntersection extends UnionToIntersection<ActionsFromExtension<GExtensions[number]>> = UnionToIntersection<
    ActionsFromExtension<GExtensions[number]>
  >
> = GIntersection;

/**
 * Utility type for pulling all the action names from a list
 */
export type ActionNames<GExtensions extends AnyExtension[]> = StringKey<
  ActionsFromExtensionList<GExtensions>
>;

/**
 * The type signature of the extension helper method. It is used in determining whether
 * or not a helper has been defined on the extension in order to infer it's return type.
 */
type ExtensionHelperMethodSignature = (...args: any[]) => ExtensionHelperReturn;

/**
 * A utility type which maps the passed in extension helpers to a method called with
 * `manager.data.helpers.helperName()`.
 */
type MapHelpers<
  GHelper extends AnyFunction,
  GHelperReturn extends ReturnType<GHelper> = ReturnType<GHelper>
> = {
  [P in Key<GHelperReturn>]: (...args: Parameters<GHelperReturn[P]>) => ReturnType<GHelperReturn[P]>;
};

/**
 * Utility type which receives an extension and provides the type of actions it makes available.
 */
export type MappedHelpersFromExtension<
  GExtension extends AnyExtension,
  GHelpers extends HelpersOfExtension<GExtension> = HelpersOfExtension<GExtension>
> = GHelpers extends ExtensionHelperMethodSignature ? MapHelpers<GHelpers> : {};

/**
 * Creates an actions intersection object from a list of provided extensions.
 */
export type MappedHelpersFromExtensionList<
  GExtensions extends AnyExtension[],
  GIntersection extends UnionToIntersection<
    MappedHelpersFromExtension<GExtensions[number]>
  > = UnionToIntersection<MappedHelpersFromExtension<GExtensions[number]>>
> = GIntersection;

/**
 * Utility type for pulling all the action names from a list
 */
export type MappedHelperNames<GExtensions extends AnyExtension[]> = StringKey<
  MappedHelpersFromExtensionList<GExtensions>
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
 * ```ts
 * const list = [ParagraphExtension, DocExtension, TextExtension, LinkExtension];
 * type ListInstances = TypeOfExtensionClassList<typeof list>;
 * // => (ParagraphExtension, DocExtension, TextExtension, LinkExtension)[]
 * ```
 */
export type TypeOfExtensionClassList<GExtensionConstructors extends AnyConstructor[]> = TypeOfExtensionClass<
  GExtensionConstructors[number]
>;

/**
 * A utility type for retrieving the name of an extension only when it's a mark extension.
 */
export type MarkName<GExtension extends AnyExtension> = GExtension extends MarkExtension
  ? GExtension['name']
  : never;

/**
 * Utility type for getting all the mark names from a list of extensions.
 *
 * This is used to define the schema mark types available on the extension manager.
 */
export type MarkNames<GExtensions extends AnyExtension[]> = MarkName<GExtensions[number]>;

/**
 * A utility type for retrieving the name of an extension only when it's a node extension.
 */
export type NodeName<GExtension extends AnyExtension> = GExtension extends NodeExtension
  ? GExtension['name']
  : never;

/**
 * Utility type for pulling all the node names from a list of extensions.
 *
 * This is used to define the schema node types available on the extension manager.
 */
export type NodeNames<GExtensions extends AnyExtension[]> = NodeName<GExtensions[number]>;

/**
 * Gets the schema from a list of extensions
 */
export type SchemaFromExtensionList<GExtensions extends AnyExtension[] = AnyExtension[]> = EditorSchema<
  NodeNames<GExtensions>,
  MarkNames<GExtensions>
>;
