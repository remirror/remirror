import {
  ExtensionPriority,
  ExtensionTag,
  ExtensionType,
  REMIRROR_IDENTIFIER_KEY,
  RemirrorIdentifier,
} from '@remirror/core-constants';
import {
  capitalize,
  deepMerge,
  isIdentifierOfType,
  isRemirrorType,
  object,
} from '@remirror/core-helpers';
import {
  AnyFunction,
  EditorSchema,
  EditorView,
  FlipPartialAndRequired,
  FunctionLike,
  IfEmpty,
  IfNoRequiredProperties,
  MarkExtensionSpec,
  MarkType,
  NodeExtensionSpec,
  NodeType,
  ProsemirrorPlugin,
} from '@remirror/core-types';
import { isMarkActive, isNodeActive } from '@remirror/core-utils';

import {
  BaseExtensionSettings,
  CreateSchemaParameter,
  ExtensionCommandReturn,
  ExtensionHelperReturn,
  ExtensionIsActiveFunction,
  GeneralExtensionTags,
  GetNameUnion,
  ManagerMarkTypeParameter,
  ManagerNodeTypeParameter,
  ManagerTypeParameter,
  MarkExtensionTags,
  NodeExtensionTags,
  OnTransactionParameter,
  PropertiesShape,
} from '../types';

/**
 * The type which is applicable to any extension instance.
 *
 * TODO Figure out how to improve the formatting of this.
 */
export type AnyExtension<Settings extends object = {}, Properties extends object = {}> = Omit<
  Extension<any, Settings, Properties, any, any, any>,
  'parameter'
> & {
  parameter: ExtensionLifecycleMethods &
    {
      [MethodName in keyof ExtensionCreatorMethods<any, any, any, any, any, any>]: AnyFunction;
    };
};

/**
 * Matches any of the three `ExtensionConstructor`s.
 */
export interface AnyExtensionConstructor extends FunctionLike {
  /**
   * The name of the extension that will be created. Also available on the
   * instance as `name`.
   */
  readonly extensionName: string;

  defaultSettings: any;
  defaultProperties: any;

  /**
   * Creates a new instance of the extension. Used when adding the extension to
   * the editor.
   */
  of: AnyFunction;
}

/**
 * Infer the type of factory parameter that's being used.
 */
type InferFactoryParameter<
  Name extends string,
  Settings extends object,
  Properties extends object = {},
  Commands extends ExtensionCommandReturn = {},
  Helpers extends ExtensionHelperReturn = {},
  ProsemirrorType = never
> = ProsemirrorType extends NodeType
  ? NodeExtensionFactoryParameter<Name, Settings, Properties, Commands, Helpers>
  : ProsemirrorType extends MarkType
  ? MarkExtensionFactoryParameter<Name, Settings, Properties, Commands, Helpers>
  : ProsemirrorType extends never
  ? PlainExtensionFactoryParameter<Name, Settings, Properties, Commands, Helpers>
  : ExtensionFactoryParameter<Name, Settings, Properties, Commands, Helpers>;

/**
 * Infer the `constructor` for the extension.
 */
type InferExtensionConstructor<
  Name extends string,
  Settings extends object,
  Properties extends object = {},
  Commands extends ExtensionCommandReturn = {},
  Helpers extends ExtensionHelperReturn = {},
  ProsemirrorType = never
> = ProsemirrorType extends NodeType
  ? NodeExtensionConstructor<Name, Settings, Properties, Commands, Helpers>
  : ProsemirrorType extends MarkType
  ? MarkExtensionConstructor<Name, Settings, Properties, Commands, Helpers>
  : ProsemirrorType extends never
  ? PlainExtensionConstructor<Name, Settings, Properties, Commands, Helpers>
  : AnyExtensionConstructor;

/**
 * These are the default options merged into every extension. They can be
 * overridden.
 */
export const defaultSettings: Required<BaseExtensionSettings> = {
  priority: null,
  extraAttributes: [],
  exclude: {},
} as any;

/**
 * Set the value for a key of the default settings. This is made available only
 * to extensions making use of the `ExtensionLifecycleMethods`.
 */
export function setDefaultExtensionSettings<Key extends keyof Remirror.BaseExtensionSettings>(
  key: Key,
  value: Required<Remirror.BaseExtensionSettings>[Key],
): void {
  defaultSettings[key] = value;
}

/**
 * Determines if the passed value is an extension.
 *
 * @param value - the value to test
 */
export function isExtension<Settings extends object = {}, Properties extends object = {}>(
  value: unknown,
): value is AnyExtension<Settings, Properties> {
  return isRemirrorType(value) && isIdentifierOfType(value, RemirrorIdentifier.Extension);
}

/**
 * Checks whether the provided value is a plain extension.
 *
 * @param value - the extension to check
 */
export function isPlainExtension<Settings extends object = {}, Properties extends object = {}>(
  value: unknown,
): value is AnyPlainExtension<Settings, Properties> {
  return isExtension(value) && value.type === ExtensionType.Plain;
}

/**
 * Determines if the passed in extension is a mark extension. Useful as a type
 * guard where a particular type of extension is needed.
 *
 * @param value - the extension to check
 */
export function isMarkExtension<Settings extends object = {}, Properties extends object = {}>(
  value: unknown,
): value is AnyMarkExtension<Settings, Properties> {
  return isExtension(value) && value.type === ExtensionType.Mark;
}

/**
 * Determines if the passed in extension is a node extension. Useful as a type
 * guard where a particular type of extension is needed.
 *
 * @param value - the extension to check
 */
export function isNodeExtension<Settings extends object = {}, Properties extends object = {}>(
  value: unknown,
): value is AnyNodeExtension<Settings, Properties> {
  return isExtension(value) && value.type === ExtensionType.Node;
}

/**
 * Extensions are fundamental to the way that Remirror works and they handle the
 * management of similar concerns.
 *
 * @remarks
 *
 * They allows for grouping items that affect editor functionality.
 *
 * - How the editor displays certain content, i.e. **bold**, _italic_,
 *   **underline**.
 * - Which commands should be made available e.g. `actions.bold()` to make
 *   selected text bold.
 * - Check if a command is currently active or enabled e.g.
 *   `actions.bold.isActive()`.
 * - Register Prosemirror plugins, keymaps, input rules paste rules and custom
 *   nodeViews which affect the behavior of the editor.
 *
 * There are three types of `Extension`.
 *
 * - `NodeExtension` - For creating Prosemirror nodes in the editor. See
 *   {@link NodeExtension}
 * - `MarkExtension` - For creating Prosemirror marks in the editor. See
 *   {@link MarkExtension}
 * - `Extension` - For behavior which doesn't need to be displayed in the dom.
 *
 * The extension is an abstract class that should not be used directly but
 * rather extended to add the intended functionality.
 *
 * ```ts
 * interface AwesomeExtOptions extends BaseExtensionOptions {
 *   isAwesome: boolean;
 * }
 *
 * class AwesomeExt extends Extension<AwesomeExtOptions> {
 *   get name() {
 *     return 'awesome' as const
 *   }
 * }
 * ```
 */
export abstract class Extension<
  Name extends string,
  Settings extends object,
  Properties extends object = {},
  Commands extends ExtensionCommandReturn = {},
  Helpers extends ExtensionHelperReturn = {},
  ProsemirrorType = never
> implements PropertiesShape<Properties> {
  /**
   * Not for public usage. This is purely for types to make it easier to infer
   * the type of `Settings` on an extension instance.
   */
  public readonly ['~S']!: Settings & BaseExtensionSettings;

  /**
   * Not for public usage. This is purely for types to make it easier to infer
   * the type of `Settings` on an extension instance.
   */
  public readonly ['~P']!: Properties;

  /**
   * Not for public usage. This is purely for types to make it easier to infer
   * the type of `Commands` on an extension instance.
   */
  public readonly ['~C']!: Commands;

  /**
   * Not for public usage. This is purely for types to make it easier to infer
   * the type of `Helpers` on an extension instance.
   */
  public readonly ['~H']!: Helpers;

  /**
   * An internal property which helps identify this instance as a
   * `RemirrorExtension`.
   */
  get [REMIRROR_IDENTIFIER_KEY]() {
    return RemirrorIdentifier.Extension;
  }

  /**
   * This defines the type of the extension.
   *
   * @remarks
   * There are three types of extension:
   *
   * - `plain` - useful for changing the runtime behavior of the extension.
   * - `node` - see {@link NodeExtension}
   * - `mark` - see {@link MarkExtension}
   *
   * This identifier is used in the extension manager to separate marks from
   * nodes and to determine the functionality of each extension.
   */
  public abstract readonly type: ExtensionType;

  /* eslint-disable @typescript-eslint/explicit-member-accessibility */
  /**
   * Private instance of the static settings.
   */
  #settings: Required<Settings & BaseExtensionSettings>;

  /**
   * Private instance of the dynamic properties for this extension.
   */
  #properties: Required<Properties>;

  /**
   * The parameter that was passed when creating the constructor for this instance.
   */
  get parameter(): Readonly<
    InferFactoryParameter<Name, Settings, Properties, Commands, Helpers, ProsemirrorType>
  > {
    return this.getFactoryParameter() as any;
  }

  /**
   * The static settings for this extension.
   *
   * @remarks
   *
   * The static settings are automatically merged with the default
   * options of this extension when it is created.
   */
  get settings(): Readonly<Required<Settings & BaseExtensionSettings>> {
    return this.#settings;
  }

  /**
   * The dynamic properties for this extension. Callback handlers and
   * behavioral properties should be placed here.
   */
  get properties() {
    return this.#properties;
  }

  /**
   * The unique name of this extension.
   *
   * @remarks
   *
   * Every extension **must** have a name. The name should have a distinct type
   * to allow for better type inference for end users. By convention the name
   * should be `camelCased` and unique within your editor instance.
   *
   * ```ts
   * class SimpleExtension extends Extension {
   *   get name() {
   *     return 'simple' as const;
   *   }
   * }
   * ```
   */
  get name(): Name {
    return this.parameter.name;
  }

  /**
   * The priority level for this instance of the extension.
   */
  get priority(): ExtensionPriority {
    return this.#settings.priority ?? this.parameter.defaultPriority ?? ExtensionPriority.Default;
  }

  /**
   * Get the default properties for this extension.
   */
  get defaultProperties(): Required<Properties> {
    return this.parameter.defaultProperties ?? object();
  }

  /**
   * Get the default settings for this extension.
   */
  get defaultSettings(): DefaultSettingsType<Settings> {
    return this.constructor.defaultSettings;
  }

  /**
   * Retrieves the tags for this extension.
   */
  get tags(): Array<ExtensionTag | string> {
    return this.parameter.extensionTags ?? [];
  }

  /**
   * Get the required extensions for this extension.
   */
  get requiredExtensions() {
    return this.parameter.requiredExtensions ?? [];
  }

  constructor(
    ...[settings]: IfNoRequiredProperties<
      Settings,
      [(Settings & BaseExtensionSettings)?],
      [Settings & BaseExtensionSettings]
    >
  ) {
    this.#settings = deepMerge(defaultSettings, {
      ...this.defaultSettings,
      ...settings,
    });

    this.#properties = { ...this.defaultProperties };
  }

  /**
   * A method that must be defined on classes that extend this.
   *
   * @remarks
   *
   * It provides all the `options` passed when this `ExtensionConstructor` was
   * created. This is for internal usage only since the `Extension` class is not
   * exported from this library.
   *
   * @internal
   */
  protected abstract getFactoryParameter(): Readonly<
    InferFactoryParameter<Name, Settings, Properties, Commands, Helpers, ProsemirrorType>
  >;

  /**
   * Update the properties with the provided value when something changes.
   */
  public setProperties(properties: Partial<Properties>) {
    this.#properties = { ...this.#properties, ...properties };
  }

  /**
   * Reset the properties to their initial state.
   */
  public resetProperties() {
    this.#properties = { ...this.defaultProperties };
  }

  /**
   * Called when the extension is removed by the manager during it's `onDestroy`
   * phase.
   */
  public destroy() {
    this.parameter.onDestroy?.();
  }

  /**
   * Override the default toString method to match the native toString methods.
   */
  public toString() {
    return `[${RemirrorIdentifier.Extension} ${capitalize(this.name)}]`;
  }
}

/**
 * Declaration merging since the constructor property can't be defined on the
 * actual class.
 */
export interface Extension<
  Name extends string,
  Settings extends object,
  Properties extends object = {},
  Commands extends ExtensionCommandReturn = {},
  Helpers extends ExtensionHelperReturn = {},
  ProsemirrorType = never
> {
  /**
   * Provides the type for the extensions constructor.
   */
  constructor: InferExtensionConstructor<
    Name,
    Settings,
    Properties,
    Commands,
    Helpers,
    ProsemirrorType
  >;
}

/**
 * Get the expected type signature for the `defaultSettings`. Requires that every
 * non-required property (not from the BaseExtension) has a value assigned.
 */
export type DefaultSettingsType<Settings extends object> = Omit<
  FlipPartialAndRequired<Settings>,
  keyof BaseExtensionSettings
> &
  Partial<BaseExtensionSettings>;

interface DefaultPropertiesParameter<Properties extends object = {}> {
  /**
   * Properties are dynamic and generated at run time. For this reason you will
   * need to provide a default value for every prop this extension uses.
   *
   * @remarks
   *
   * Properties are dynamically assigned options that are injected into the
   * editor at runtime. Every single property that the extension will use needs
   * to have a default value set.
   *
   * This must be set when creating the extension, even if just to the empty
   * object when no properties are used at runtime.
   */
  defaultProperties: Required<Properties>;
}

interface DefaultSettingsParameter<Settings extends object> {
  /**
   * The settings helps define the properties schema and built in behavior of
   * this extension.
   *
   * @remarks
   *
   * Once set it can't be updated during run time. Some of the settings are
   * optional and some are not. Any non-required settings must be specified in
   * the `defaultSettings`.
   *
   * This must be set when creating the extension, even if just to the empty
   * object when no properties are used at runtime.
   *
   * There is a slight downside in the way this is setup. `undefined` is not
   * supported for partial settings at this point in time. As a workaround
   * use `null` as the type and pass it as the value in the default settings.
   */
  /**
   * The default settings for instances of this extension.
   */
  defaultSettings: DefaultSettingsType<Settings>;

  /**
   * The default properties for instances of this extension. */
}

/**
 * The configuration parameter which is passed into an `ExtensionFactory` to
 * create the `ExtensionConstructor`.
 */
export interface BaseExtensionFactoryParameter<
  Name extends string,
  Settings extends object,
  Properties extends object = {},
  Commands extends ExtensionCommandReturn = {},
  Helpers extends ExtensionHelperReturn = {},
  ProsemirrorType = never
>
  extends ExtensionLifecycleMethods,
    Remirror.ExtensionFactoryParameter<
      Name,
      Settings,
      Properties,
      Commands,
      Helpers,
      ProsemirrorType
    >,
    ExtensionCreatorMethods<Name, Settings, Properties, Commands, Helpers, ProsemirrorType> {
  /**
   * The unique name of this extension.
   *
   * @remarks
   *
   * Every extension **must** have a name. Ideally the name should have a
   * distinct type to allow for better type inference for end users. By
   * convention the name should be `camelCased` and unique within your editor
   * instance.
   */
  name: Name;

  /**
   * Every extension requires compatible string with the version number of the extension. This
   * is required
   */
  version?: string;

  /**
   * The default priority level for the extension to use.
   *
   * @remarks
   *
   * The priority levels help determine the order in which an extension is
   * loaded within the editor. High priority extensions are given precedence.
   *
   * @defaultValue `ExtensionPriority.Default`
   */
  defaultPriority?: ExtensionPriority;

  /**
   * Define the tags for this extension.
   *
   * @remarks
   *
   * Tags are a helpful tool for categorizing the behavior of an extension. This
   * behavior is later grouped in the `Manager` and passed as `tag` to
   * each method defined in the `ExtensionFactoryParameter`. It can be used by
   * commands that need to remove all formatting and use the tag to identify
   * which registered extensions are formatters.
   *
   * There are internally defined tags but it's also possible to define any
   * custom string as a tag. See {@link ExtensionTag}
   */
  extensionTags?: Array<ExtensionTag | string>;

  /**
   * An extension can declare the extensions it requires.
   *
   * @remarks
   *
   * When creating the extension manager the extension will be checked for
   * required extension as well as a quick check to see if the required
   * extension is already included. If not present a descriptive error will be
   * thrown.
   */
  requiredExtensions?: readonly AnyExtensionConstructor[];
}

interface ExtensionCreatorMethods<
  Name extends string,
  Settings extends object,
  Properties extends object = {},
  Commands extends ExtensionCommandReturn = {},
  Helpers extends ExtensionHelperReturn = {},
  ProsemirrorType = never
>
  extends Remirror.ExtensionCreatorMethods<
    Name,
    Settings,
    Properties,
    Commands,
    Helpers,
    ProsemirrorType
  > {}

export interface ExtensionLifecycleMethods {
  /**
   * Handlers called when the Manager is first created.
   */
  onCreate?: (parameter: CreateLifecycleMethodParameter) => CreateLifecycleMethodReturn;

  /**
   * This happens when the store is initialized.
   */
  onInitialize?: (parameter: InitializeLifecycleMethodParameter) => InitializeLifecycleMethodReturn;

  /**
   * This event happens when the view is first received from the view layer
   * (e.g. React).
   */
  onView?: (parameter: ViewLifecycleMethodParameter) => ViewLifecycleMethodReturn;

  /**
   * Called when a transaction successfully updates the editor state.
   *
   * Changes to the transaction at this point have no impact at all. It is
   * purely for observational reasons
   */
  onTransaction?: (parameter: OnTransactionParameter) => void;

  /**
   * Called when the extension is being destroyed.
   */
  onDestroy?: () => void;
}

export type ExtensionFactoryParameter<
  Name extends string,
  Settings extends object,
  Properties extends object = {},
  Commands extends ExtensionCommandReturn = {},
  Helpers extends ExtensionHelperReturn = {},
  ProsemirrorType = never
> = BaseExtensionFactoryParameter<Name, Settings, Properties, Commands, Helpers, ProsemirrorType> &
  IfEmpty<
    Properties,
    Partial<DefaultPropertiesParameter<Properties>>,
    DefaultPropertiesParameter<Properties>
  > &
  IfEmpty<
    Settings,
    Partial<DefaultSettingsParameter<Settings>>,
    DefaultSettingsParameter<Settings>
  >;

export abstract class PlainExtension<
  Name extends string,
  Settings extends object,
  Properties extends object = {},
  Commands extends ExtensionCommandReturn = {},
  Helpers extends ExtensionHelperReturn = {}
> extends Extension<Name, Settings, Properties, Commands, Helpers> {
  /**
   * Identifies this extension as a **NODE** type from the prosemirror
   * terminology.
   */
  get type() {
    return ExtensionType.Plain as const;
  }
}

export type PlainExtensionFactoryParameter<
  Name extends string,
  Settings extends object,
  Properties extends object = {},
  Commands extends ExtensionCommandReturn = {},
  Helpers extends ExtensionHelperReturn = {}
> = ExtensionFactoryParameter<Name, Settings, Properties, Commands, Helpers>;

/**
 * The type covering any potential `PlainExtension`.
 */
export type AnyPlainExtension<
  Settings extends object = {},
  Properties extends object = {}
> = Extension<string, Settings, Properties, any, any>;

/**
 * The shape of the `ExtensionConstructor` used to create instances of
 * extensions and returned from the `ExtensionFactory.plain()` method.
 */
export interface PlainExtensionConstructor<
  Name extends string,
  Settings extends object,
  Properties extends object = {},
  Commands extends ExtensionCommandReturn = {},
  Helpers extends ExtensionHelperReturn = {}
> extends FunctionLike {
  /**
   * Get the name of the extensions created by this constructor.
   */
  readonly extensionName: Name;

  /**
   * The default settings for instances of this extension.
   */
  defaultSettings: DefaultSettingsType<Settings>;

  /**
   * The default properties for instances of this extension.
   */
  defaultProperties: Required<Properties>;

  /**
   * Create a new instance of the extension to be inserted into the editor.
   *
   * This is used to prevent the need for the `new` keyword which can lead to
   * problems.
   */
  of: (
    ...settings: IfNoRequiredProperties<
      Settings,
      [(Settings & BaseExtensionSettings)?],
      [Settings & BaseExtensionSettings]
    >
  ) => PlainExtension<Name, Settings, Properties, Commands, Helpers>;
}

/**
 * A mark extension is based on the `Mark` concept from from within prosemirror
 * {@link https://prosemirror.net/docs/guide/#schema.marks}
 *
 * @remarks
 *
 * Marks are used to add extra styling or other information to inline content.
 * Mark types are objects much like node types, used to tag mark objects and
 * provide additional information about them.
 */
export abstract class MarkExtension<
  Name extends string,
  Settings extends object,
  Properties extends object = {},
  Commands extends ExtensionCommandReturn = {},
  Helpers extends ExtensionHelperReturn = {}
> extends Extension<Name, Settings, Properties, Commands, Helpers, MarkType<EditorSchema>> {
  /**
   * Set's the type of this extension to be a `Mark`.
   *
   * @remarks
   *
   * This value is used by the predicates to check whether this is a mark / node
   * or plain extension.
   */
  get type() {
    return ExtensionType.Mark as const;
  }

  get schema(): Readonly<MarkExtensionSpec> {
    return this.#schema;
  }

  /**
   * The prosemirror specification which sets up the mark in the schema.
   *
   * @remarks
   *
   * The main difference between this and Prosemirror `MarkSpec` is that that
   * the `toDOM` method doesn't allow dom manipulation. You can only return an
   * array or string.
   *
   * For more advanced requirements, it may be possible to create a nodeView to
   * manage the dom interactions.
   */
  readonly #schema: MarkExtensionSpec;

  constructor(
    ...parameters: IfNoRequiredProperties<
      Settings,
      [(Settings & BaseExtensionSettings)?],
      [Settings & BaseExtensionSettings]
    >
  ) {
    super(...parameters);

    this.#schema = this.getFactoryParameter().createMarkSchema({
      settings: this.settings,
      properties: this.properties,
    });
  }

  /**
   * Performs a default check to see whether the mark is active at the current
   * selection.
   *
   * @param parameter - see
   * {@link @remirror/core-types#ManagerMarkTypeParameter}
   */
  public isActive({ getState, type }: ManagerMarkTypeParameter): ExtensionIsActiveFunction {
    return () => isMarkActive({ stateOrTransaction: getState(), type });
  }
}

/**
 * The creator options when creating a node.
 */
export type MarkExtensionFactoryParameter<
  Name extends string,
  Settings extends object,
  Properties extends object = {},
  Commands extends ExtensionCommandReturn = {},
  Helpers extends ExtensionHelperReturn = {}
> = ExtensionFactoryParameter<
  Name,
  Settings,
  Properties,
  Commands,
  Helpers,
  MarkType<EditorSchema>
> & {
  /**
   * Provide a method for creating the schema. This is required in order to
   * create a `MarkExtension`.
   */
  createMarkSchema: (parameter: CreateSchemaParameter<Settings, Properties>) => MarkExtensionSpec;
};

/**
 * The type covering any potential `MarkExtension`.
 */
export type AnyMarkExtension<
  Settings extends object = {},
  Properties extends object = {}
> = MarkExtension<string, Settings, Properties, any, any>;

/**
 * The shape of the `MarkExtensionConstructor` used to create extensions and
 * returned from the `ExtensionFactory.mark()` method.
 */
export interface MarkExtensionConstructor<
  Name extends string,
  Settings extends object,
  Properties extends object = {},
  Commands extends ExtensionCommandReturn = {},
  Helpers extends ExtensionHelperReturn = {}
> extends FunctionLike {
  /**
   * Get the name of the extensions created by this constructor.
   */
  readonly extensionName: Name;

  /**
   * The default settings for instances of this extension.
   */
  defaultSettings: DefaultSettingsType<Settings>;

  /**
   * The default properties for instances of this extension.
   */
  defaultProperties: Required<Properties>;

  /**
   * Create a new instance of the extension to be inserted into the editor.
   *
   * This is used to prevent the need for the `new` keyword which can lead to
   * problems.
   */
  of: (
    ...settings: IfNoRequiredProperties<
      Settings,
      [(Settings & BaseExtensionSettings)?],
      [Settings & BaseExtensionSettings]
    >
  ) => MarkExtension<Name, Settings, Properties, Commands, Helpers>;
}

/**
 * Defines the abstract class for extensions which can place nodes into the
 * prosemirror state.
 *
 * @remarks
 *
 * For more information see {@link https://prosemirror.net/docs/ref/#model.Node}
 */
export abstract class NodeExtension<
  Name extends string,
  Settings extends object,
  Properties extends object = {},
  Commands extends ExtensionCommandReturn = {},
  Helpers extends ExtensionHelperReturn = {}
> extends Extension<Name, Settings, Properties, Commands, Helpers, NodeType<EditorSchema>> {
  /**
   * Identifies this extension as a **NODE** type from the prosemirror
   * terminology.
   */
  get type() {
    return ExtensionType.Node as const;
  }

  get schema(): Readonly<NodeExtensionSpec> {
    return this.#schema;
  }

  /**
   * The prosemirror specification which sets up the node in the schema.
   *
   * @remarks
   *
   * The main difference between this and Prosemirror `NodeSpec` is that that
   * the `toDOM` method doesn't allow dom manipulation. You can only return an
   * array or string.
   *
   * For more advanced settings, where dom manipulation is required, it is
   * advisable to set up a nodeView.
   */
  readonly #schema: NodeExtensionSpec;
  /* eslint-enable @typescript-eslint/explicit-member-accessibility */

  constructor(
    ...parameters: IfNoRequiredProperties<
      Settings,
      [(Settings & BaseExtensionSettings)?],
      [Settings & BaseExtensionSettings]
    >
  ) {
    super(...parameters);

    this.#schema = this.getFactoryParameter().createNodeSchema({
      settings: this.settings,
      properties: this.properties,
    });
  }

  public isActive({ getState, type }: ManagerNodeTypeParameter): ExtensionIsActiveFunction {
    return ({ attrs }) => {
      return isNodeActive({ state: getState(), type, attrs: attrs });
    };
  }
}

/**
 * The creator options when creating a node.
 */
export type NodeExtensionFactoryParameter<
  Name extends string,
  Settings extends object,
  Properties extends object = {},
  Commands extends ExtensionCommandReturn = {},
  Helpers extends ExtensionHelperReturn = {}
> = ExtensionFactoryParameter<
  Name,
  Settings,
  Properties,
  Commands,
  Helpers,
  NodeType<EditorSchema>
> & {
  /**
   * Provide a method for creating the schema. This is required in order to
   * create a `NodeExtension`.
   *
   * @remarks
   *
   * A node schema defines the behavior of the content within the editor. This
   * is very tied to the prosemirror implementation and the best place to learn
   * more about it is in the
   * {@link https://prosemirror.net/docs/guide/#schema docs}.
   */
  createNodeSchema: (parameter: CreateSchemaParameter<Settings, Properties>) => NodeExtensionSpec;
};

/**
 * The type covering any potential NodeExtension.
 */
export type AnyNodeExtension<
  Settings extends object = {},
  Properties extends object = {}
> = NodeExtension<string, Settings, Properties, any, any>;

/**
 * The shape of the `NodeExtensionConstructor` used to create extensions and
 * returned from the `ExtensionFactory.node()` method.
 */
export interface NodeExtensionConstructor<
  Name extends string,
  Settings extends object,
  Properties extends object = {},
  Commands extends ExtensionCommandReturn = {},
  Helpers extends ExtensionHelperReturn = {}
> extends FunctionLike {
  /**
   * Get the name of the extensions created by this constructor.
   */
  readonly extensionName: Name;

  /**
   * The default settings for instances of this extension.
   */
  defaultSettings: DefaultSettingsType<Settings>;

  /**
   * The default properties for instances of this extension.
   */
  defaultProperties: Required<Properties>;

  /**
   * Create a new instance of the extension to be inserted into the editor.
   *
   * This is used to prevent the need for the `new` keyword which can lead to
   * problems.
   */
  of: (
    ...settings: IfNoRequiredProperties<
      Settings,
      [(Settings & BaseExtensionSettings)?],
      [Settings & BaseExtensionSettings]
    >
  ) => NodeExtension<Name, Settings, Properties, Commands, Helpers>;
}

/**
 * The shape of the tag data stored by the extension manager.
 *
 * This data can be used by other extensions to dynamically determine which
 * nodes should affected by commands / plugins / keys etc...
 */
export interface ExtensionTags<ExtensionUnion extends AnyExtension> {
  /**
   * All the node extension tags.
   */
  node: NodeExtensionTags<GetNodeNameUnion<ExtensionUnion>>;

  /**
   * All the mar extension tags.
   */
  mark: MarkExtensionTags<GetMarkNameUnion<ExtensionUnion>>;

  /**
   * All the general extension tags.
   */
  general: GeneralExtensionTags<GetNameUnion<ExtensionUnion>>;
}

/**
 * A utility type for retrieving the name of an extension only when it's a plain
 * extension.
 */
export type GetPlainNames<Type> = Type extends AnyPlainExtension ? GetNameUnion<Type> : never;

/**
 * A utility type for retrieving the name of an extension only when it's a mark
 * extension.
 */
export type GetMarkNameUnion<
  ExtensionUnion extends AnyExtension
> = ExtensionUnion extends AnyMarkExtension ? ExtensionUnion['name'] : never;

/**
 * A utility type for retrieving the name of an extension only when it's a node
 * extension.
 */
export type GetNodeNameUnion<
  ExtensionUnion extends AnyExtension
> = ExtensionUnion extends AnyNodeExtension ? ExtensionUnion['name'] : never;

/**
 * Gets the editor schema from an extension union.
 */
export type SchemaFromExtension<ExtensionUnion extends AnyExtension> = EditorSchema<
  GetNodeNameUnion<ExtensionUnion>,
  GetMarkNameUnion<ExtensionUnion>
>;

export type AnyManagerStore = Remirror.ManagerStore<any, any>;
export type ManagerStoreKeys = keyof Remirror.ManagerStore<any, any>;

export interface CreateLifecycleMethodParameter {
  /**
   * Get the value of a key from the manager store.
   */
  getStoreKey: <Key extends ManagerStoreKeys>(key: Key) => Readonly<AnyManagerStore[Key]>;

  /**
   * Update the store with a specific key.
   */
  setStoreKey: <Key extends ManagerStoreKeys>(key: Key, value: AnyManagerStore[Key]) => void;

  /**
   * The settings passed through to the manager.
   */
  managerSettings: Remirror.ManagerSettings;

  /**
   * Sets a property for the default settings object.
   */
  setDefaultExtensionSettings: <Key extends keyof Remirror.BaseExtensionSettings>(
    key: Key,
    value: Required<Remirror.BaseExtensionSettings>[Key],
  ) => void;

  /** Set a custom manager method parameter. */
  setManagerMethodParameter: <Key extends keyof Remirror.ManagerMethodParameter>(
    key: Key,
    value: Remirror.ManagerMethodParameter[Key],
  ) => void;
}

export interface CreateLifecycleMethodReturn {
  /**
   * Called before the extension loop is run.
   */
  beforeExtensionLoop?: () => void;

  /**
   * Called for each extension in order of their priority.
   */
  forEachExtension?: (extension: AnyExtension) => void;

  /**
   * Run after the extensions have been looped through. Useful for adding data
   * to the store and doing any cleanup for the RemirrorMethod.
   */
  afterExtensionLoop?: () => void;
}

export interface InitializeLifecycleMethodParameter extends ViewLifecycleMethodParameter {
  /**
   * Use this to push custom plugins to the store which are added to the plugin
   * list after the extensionPlugins.
   */
  addPlugins: (...plugins: ProsemirrorPlugin[]) => void;
}

export interface InitializeLifecycleMethodReturn extends CreateLifecycleMethodReturn {}

export interface ViewLifecycleMethodParameter
  extends Omit<
    CreateLifecycleMethodParameter,
    'setDefaultExtensionSettings' | 'setManagerMethodParameter'
  > {
  /**
   * The parameter passed into most of the extension creator methods.
   */
  getParameter: <Type = never>(extension: AnyExtension) => ManagerTypeParameter<Type>;
}

export interface ViewLifecycleMethodReturn {
  /**
   * Run before the extensions have been looped through. Useful for adding data
   * to the store and doing any cleanup for the RemirrorMethod.
   */
  beforeExtensionLoop?: (view: EditorView<EditorSchema>) => void;

  /**
   * Called for each extension in order of their priority.
   */
  forEachExtension?: (extension: AnyExtension, view: EditorView<EditorSchema>) => void;

  /**
   * Run after the extensions have been looped through. Useful for adding data
   * to the store and doing any cleanup for the RemirrorMethod.
   */
  afterExtensionLoop?: (view: EditorView<EditorSchema>) => void;
}

declare global {
  /**
   * This namespace is global and you can use declaration merging to extend
   * and create new types used by the `remirror` project.
   *
   * @remarks
   *
   * The following would add `MyCustomType` to the `Remirror` namespace.
   * Please note that this can only be used for types and interfaces.
   *
   * ```ts
   * declare global {
   *   namespace Remirror {
   *     type MyCustomType = 'look-at-me';
   *   }
   * }
   * ```
   */
  namespace Remirror {
    /**
     * This interface is global and can use declaration merging to add extra
     * options that can be passed into the passed into the `ExtensionFactory`.
     *
     * @remarks
     *
     * The following will add `newOption` to the expected options. This is the
     * way that extensions which add new functionality to the editor can request
     * configuration options.
     *
     * ```ts
     * declare global {
     *   namespace Remirror {
     *     interface ExtensionFactoryParameter {
     *       newOption?: string;
     *     }
     *   }
     * }
     * ```
     */
    export interface ExtensionFactoryParameter<
      Name extends string,
      Settings extends object,
      Properties extends object,
      Commands extends ExtensionCommandReturn,
      Helpers extends ExtensionHelperReturn,
      ProsemirrorType = never
    > {}

    export interface ExtensionCreatorMethods<
      Name extends string,
      Settings extends object,
      Properties extends object,
      Commands extends ExtensionCommandReturn,
      Helpers extends ExtensionHelperReturn,
      ProsemirrorType = never
    > {}

    /**
     * This interface should overridden to add extra options to the options that can be
     * passed into the `ExtensionFactory.node()`.
     */
    export interface NodeExtensionFactoryParameter<
      Name extends string,
      Settings extends object,
      Properties extends object = {},
      Commands extends ExtensionCommandReturn = {},
      Helpers extends ExtensionHelperReturn = {}
    > {}

    /**
     * This type should overridden to add extra options to the options that can be
     * passed into the `ExtensionFactory.mark()`.
     */
    export interface MarkExtensionFactoryParameter<
      Name extends string,
      Settings extends object,
      Properties extends object = {},
      Commands extends ExtensionCommandReturn = {},
      Helpers extends ExtensionHelperReturn = {}
    > {}
  }
}
