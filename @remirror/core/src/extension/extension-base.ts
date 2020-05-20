/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable @typescript-eslint/explicit-member-accessibility */
import {
  ExtensionPriority,
  ExtensionTag,
  REMIRROR_IDENTIFIER_KEY,
  RemirrorIdentifier,
} from '@remirror/core-constants';
import {
  deepMerge,
  freeze,
  isIdentifierOfType,
  isRemirrorType,
  object,
} from '@remirror/core-helpers';
import {
  And,
  EditorSchema,
  EditorView,
  FlipPartialAndRequired,
  IfNoRequiredProperties,
  MarkExtensionSpec,
  MarkType,
  NodeExtensionSpec,
  NodeType,
  ProsemirrorPlugin,
  Shape,
} from '@remirror/core-types';
import { isMarkActive, isNodeActive } from '@remirror/core-utils';

import {
  BaseExtensionSettings,
  ExtensionIsActiveFunction,
  GeneralExtensionTags,
  GetNameUnion,
  ManagerMarkTypeParameter,
  ManagerNodeTypeParameter,
  MarkExtensionTags,
  NodeExtensionTags,
  PartialProperties,
  PropertiesShape,
  TransactionLifecycleMethod,
} from '../types';

/**
 * The type which is applicable to any extension instance.
 */
export type AnyExtension<Settings extends Shape = Shape, Properties extends Shape = Shape> = Omit<
  Extension<Settings, Properties>,
  'constructor'
> & { constructor: AnyExtensionConstructor };

/**
 * The type which is applicable to any extension instance.
 */
export type AnyExtensionConstructor = ExtensionConstructor<any, any>;

/**
 * The type for any potential PlainExtension.
 */
export type AnyPlainExtension = Omit<PlainExtension<any, any>, 'constructor'> & {
  constructor: AnyExtensionConstructor;
};

/**
 * The type for any potential NodeExtension.
 */
export type AnyNodeExtension = Omit<NodeExtension<any, any>, 'constructor'> & {
  constructor: AnyExtensionConstructor;
};

/**
 * The type for any potential MarkExtension.
 */
export type AnyMarkExtension = Omit<MarkExtension<any, any>, 'constructor'> & {
  constructor: AnyExtensionConstructor;
};

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
export function isExtension<Settings extends Shape = Shape, Properties extends Shape = Shape>(
  value: unknown,
): value is AnyExtension<Settings, Properties> {
  return (
    isRemirrorType(value) &&
    isIdentifierOfType(value, [
      RemirrorIdentifier.PlainExtension,
      RemirrorIdentifier.MarkExtension,
      RemirrorIdentifier.NodeExtension,
    ])
  );
}

/**
 * Determines if the passed value is an extension constructor.
 *
 * @param value - the value to test
 */
export function isExtensionConstructor(value: unknown): value is AnyExtensionConstructor {
  return (
    isRemirrorType(value) &&
    isIdentifierOfType(value, [
      RemirrorIdentifier.PlainExtensionConstructor,
      RemirrorIdentifier.MarkExtensionConstructor,
      RemirrorIdentifier.NodeExtensionConstructor,
    ])
  );
}

/**
 * Checks whether the provided value is a plain extension.
 *
 * @param value - the extension to check
 */
export function isPlainExtension(value: unknown): value is AnyPlainExtension {
  return isRemirrorType(value) && isIdentifierOfType(value, RemirrorIdentifier.PlainExtension);
}

/**
 * Determines if the passed in extension is a node extension. Useful as a type
 * guard where a particular type of extension is needed.
 *
 * @param value - the extension to check
 */
export function isNodeExtension(value: unknown): value is AnyNodeExtension {
  return isRemirrorType(value) && isIdentifierOfType(value, RemirrorIdentifier.NodeExtension);
}

/**
 * Determines if the passed in extension is a mark extension. Useful as a type
 * guard where a particular type of extension is needed.
 *
 * @param value - the extension to check
 */
export function isMarkExtension(value: unknown): value is AnyMarkExtension {
  return isRemirrorType(value) && isIdentifierOfType(value, RemirrorIdentifier.MarkExtension);
}

/**
 * Adds a partial and optional properties key to the provided object.
 *
 * This is used to allow for the settings object to also define some initial
 * properties when being constructed.
 */
export type WithProperties<Type extends Shape, Properties extends Shape = {}> = And<
  Type,
  Partial<PartialProperties<Properties>>
>;

/**
 * Auto infers the parameter for the extension constructor. If there is a
 * required setting then it won't compile without that setting defined.
 */
export type ExtensionConstructorParameter<
  Settings extends Shape,
  Properties extends Shape
> = IfNoRequiredProperties<
  Settings,
  [WithProperties<Settings & BaseExtensionSettings, Properties>?],
  [WithProperties<Settings & BaseExtensionSettings, Properties>]
>;

interface ExtensionConstructor<Settings extends Shape = {}, Properties extends Shape = {}>
  extends Function {
  new (...parameters: ExtensionConstructorParameter<Settings, Properties>): Extension<
    Settings,
    Shape
  >;

  /**
   * The identifier for the constructor which can determine whether it is a node
   * constructor, mark constructor or plain constructor.
   * @internal
   */
  readonly [REMIRROR_IDENTIFIER_KEY]: RemirrorIdentifier;
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
 * import { PlainExtension } from '@remirror/core';
 *
 * interface AwesomeExtensionSettings {
 *   isAwesome: boolean;
 * }
 *
 * interface AwesomeExtensionProperties {
 *   id: string;
 * }
 *
 * class AwesomeExtension extends PlainExtension<AwesomeExtensionSettings, AwesomeExtensionProperties> {
 *   name = 'awesome' as const;
 * }
 * ```
 */
abstract class Extension<Settings extends Shape = {}, Properties extends Shape = {}>
  implements PropertiesShape<Properties> {
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
  public abstract readonly name: string;

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
   * The priority level for this instance of the extension.
   */
  get priority(): ExtensionPriority {
    return this.#settings.priority ?? this.defaultPriority ?? ExtensionPriority.Default;
  }

  /**
   * The store is a property that's internal to extension. It include important
   * items like the `view` and `schema` that are added by the extension manager
   * and also the lifecycle extension methods.
   */
  protected get store() {
    return freeze(this.#store, { requireKeys: true });
  }

  /**
   * This store is can be modified by the extension manager with and lifecycle
   * extension methods.
   *
   * Different properties are added at different times so it's important to
   * check the documentation for each property to know what phase is being added.
   */
  #store!: Remirror.ExtensionStore;

  /**
   * Cached `defaultSettings`.
   */
  #defaultSettings: DefaultSettingsType<Settings>;

  /**
   * Cached `defaultProperties`.
   */
  #defaultProperties: Required<Properties>;

  /**
   * Private instance of the static settings.
   */
  #settings: Readonly<Required<Settings & BaseExtensionSettings>>;

  /**
   * Private instance of the dynamic properties for this extension.
   */
  #properties: Required<Properties>;

  constructor(...parameters: ExtensionConstructorParameter<Settings, Properties>) {
    const [settings] = parameters;

    this.#defaultSettings = this.createDefaultSettings();
    this.#defaultProperties = this.createDefaultProperties();
    this.#settings = deepMerge(defaultSettings, this.#defaultSettings, settings ?? object());
    this.#properties = { ...this.#defaultProperties, ...settings?.properties };
  }

  /**
   * Define the `defaultSettings` for this extension.
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
   *
   * @internal
   */
  protected abstract createDefaultSettings(): DefaultSettingsType<Settings>;

  /**
   * A method that creates the default properties. All properties must have a
   * default property assigned.
   *
   * @internal
   */
  protected abstract createDefaultProperties(): Required<Properties>;

  /**
   * Update the properties with the provided partial value when changed.
   */
  public setProperties(properties: Partial<Properties>) {
    this.#properties = { ...this.#properties, ...properties };
  }

  /**
   * Reset the extension properties to their default values.
   */
  public resetProperties() {
    this.#properties = { ...this.#defaultProperties };
  }

  /**
   * Pass a reference to the manager store into the extension.
   *
   * @remarks
   *
   * This should only be used by the `EditorManager`.
   *
   * @internal
   */
  public setStore(store: Remirror.ExtensionStore) {
    if (this.#store) {
      return;
    }

    this.#store = store;
  }

  /**
   * The identifier for the extension which can determine whether it is a node,
   * mark or plain extension.
   * @internal
   */
  public abstract readonly [REMIRROR_IDENTIFIER_KEY]: RemirrorIdentifier;
}

/**
 * Declaration merging since the constructor property can't be defined on the
 * actual class.
 */
interface Extension<Settings extends Shape = {}, Properties extends Shape = {}>
  extends ExtensionLifecycleMethods,
    Remirror.ExtensionCreatorMethods<Settings, Properties>,
    Remirror.BaseExtension {
  constructor: ExtensionConstructor<Settings, Properties>;
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
  tags?: Array<ExtensionTag | string>;

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
  requiredExtensions?: object[];

  /**
   * Not for public usage. This is purely for types to make it easier to infer
   * the type of `Settings` on an extension instance.
   */
  ['~S']: Settings & BaseExtensionSettings;

  /**
   * Not for public usage. This is purely for types to make it easier to infer
   * the type of `Settings` on an extension instance.
   */
  ['~P']: Properties;
}

/**
 * Get the expected type signature for the `defaultSettings`. Requires that
 * every optional setting key (except for keys which are defined on the
 * `BaseExtensionSettings`) has a value assigned.
 */
export type DefaultSettingsType<Settings extends Shape> = Omit<
  FlipPartialAndRequired<Settings>,
  keyof BaseExtensionSettings
> &
  Partial<BaseExtensionSettings>;

interface ExtensionLifecycleMethods {
  /**
   * Handlers called when the Manager is first created.
   */
  onCreate?: CreateLifecycleMethod;

  /**
   * This happens when the store is initialized.
   */
  onInitialize?: InitializeLifecycleMethod;

  /**
   * This event happens when the view is first received from the view layer
   * (e.g. React).
   */
  onView?: ViewLifecycleMethod;

  /**
   * Called when a transaction successfully updates the editor state.
   *
   * @remarks
   *
   * It should return a handler function which receives the state and the
   * transaction which created the new state. It also receives the view.
   */
  onTransaction?: TransactionLifecycleMethod;

  /**
   * Called when the extension is being destroyed.
   */
  onDestroy?: () => void;
}

export abstract class PlainExtension<
  Settings extends Shape = {},
  Properties extends Shape = {}
> extends Extension<Settings, Properties> {
  static get [REMIRROR_IDENTIFIER_KEY]() {
    return RemirrorIdentifier.PlainExtensionConstructor as const;
  }

  get [REMIRROR_IDENTIFIER_KEY]() {
    return RemirrorIdentifier.PlainExtension as const;
  }
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
  Settings extends Shape = {},
  Properties extends Shape = {}
> extends Extension<Settings, Properties> {
  static get [REMIRROR_IDENTIFIER_KEY]() {
    return RemirrorIdentifier.MarkExtensionConstructor as const;
  }

  get [REMIRROR_IDENTIFIER_KEY]() {
    return RemirrorIdentifier.NodeExtension as const;
  }

  get spec(): Readonly<MarkExtensionSpec> {
    return this.#spec;
  }

  /**
   * Provides access to the mark type from the schema.
   *
   * @remarks
   *
   * The type is available when the manager initializes. So it can be used in
   * the outer scope of `createCommands`, `createHelpers`, `createKeymap` and
   * most of the creator methods.
   */
  get type(): MarkType {
    return this.store.schema.marks[this.name];
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
  readonly #spec: MarkExtensionSpec;

  constructor(...parameters: ExtensionConstructorParameter<Settings, Properties>) {
    super(...parameters);

    this.#spec = this.createMarkSpec();
  }

  /**
   * Performs a default check to see whether the mark is active at the current
   * selection.
   *
   * @param parameter - see
   */
  public isActive({ getState, type }: ManagerMarkTypeParameter): ExtensionIsActiveFunction {
    return () => isMarkActive({ stateOrTransaction: getState(), type });
  }

  /**
   * Provide a method for creating the schema. This is required in order to
   * create a `MarkExtension`.
   */
  protected abstract createMarkSpec(): MarkExtensionSpec;
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
  Settings extends Shape = {},
  Properties extends Shape = {}
> extends Extension<Settings, Properties> {
  static get [REMIRROR_IDENTIFIER_KEY]() {
    return RemirrorIdentifier.NodeExtensionConstructor as const;
  }

  get [REMIRROR_IDENTIFIER_KEY]() {
    return RemirrorIdentifier.NodeExtension as const;
  }

  get spec(): Readonly<NodeExtensionSpec> {
    return this.#spec;
  }

  /**
   * Provides access to the node type from the schema.
   */
  get type(): NodeType {
    return this.store.schema.nodes[this.name];
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
  readonly #spec: NodeExtensionSpec;

  constructor(...parameters: ExtensionConstructorParameter<Settings, Properties>) {
    super(...parameters);

    this.#spec = this.createNodeSpec();
  }

  /**
   * Check if the node is active.
   */
  public isActive({ getState, type }: ManagerNodeTypeParameter): ExtensionIsActiveFunction {
    return ({ attrs }) => {
      return isNodeActive({ state: getState(), type, attrs: attrs });
    };
  }

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
  protected abstract createNodeSpec(): NodeExtensionSpec;
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
export type SchemaFromExtensionUnion<ExtensionUnion extends AnyExtension> = EditorSchema<
  GetNodeNameUnion<ExtensionUnion>,
  GetMarkNameUnion<ExtensionUnion>
>;

export type AnyManagerStore = Remirror.ManagerStore<any, any>;
export type ManagerStoreKeys = keyof Remirror.ManagerStore<any, any>;

export interface CreateLifecycleParameter {
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
  setExtensionStore: <Key extends keyof Remirror.ExtensionStore>(
    key: Key,
    value: Remirror.ExtensionStore[Key],
  ) => void;
}

export interface CreateLifecycleReturn {
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

export type CreateLifecycleMethod = (parameter: CreateLifecycleParameter) => CreateLifecycleReturn;

export interface InitializeLifecycleParameter extends ViewLifecycleParameter {
  /**
   * Use this to push custom plugins to the store which are added to the plugin
   * list after the extensionPlugins.
   */
  addPlugins: (...plugins: ProsemirrorPlugin[]) => void;
}

export interface InitializeLifecycleReturn extends CreateLifecycleReturn {}

export type InitializeLifecycleMethod = (
  parameter: InitializeLifecycleParameter,
) => InitializeLifecycleReturn;

export interface ViewLifecycleParameter
  extends Omit<CreateLifecycleParameter, 'setDefaultExtensionSettings' | 'setExtensionStore'> {}

export interface ViewLifecycleReturn {
  /**
   * Called for each extension in order of their priority.
   */
  forEachExtension?: (extension: AnyExtension) => void;

  /**
   * Run after the extensions have been looped through. Useful for adding data
   * to the store and doing any cleanup for the RemirrorMethod.
   */
  afterExtensionLoop?: (view: EditorView<EditorSchema>) => void;
}

export type ViewLifecycleMethod = (parameter: ViewLifecycleParameter) => ViewLifecycleReturn;

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
     * methods and properties on all `Extension`s.
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
    export interface BaseExtension {}

    /**
     * This interface is global and uses declaration merging to add new methods
     * to the `Extension` class.
     */
    export interface ExtensionCreatorMethods<
      Settings extends Shape,
      Properties extends Shape = {}
    > {}
  }
}

/* eslint-enable @typescript-eslint/member-ordering */
/* eslint-enable @typescript-eslint/explicit-member-accessibility */
