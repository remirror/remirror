/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable @typescript-eslint/explicit-member-accessibility */
import {
  ErrorConstant,
  ExtensionPriority,
  ExtensionTag,
  REMIRROR_IDENTIFIER_KEY,
  RemirrorIdentifier,
} from '@remirror/core-constants';
import {
  deepMerge,
  freeze,
  invariant,
  isIdentifierOfType,
  isPlainObject,
  isRemirrorType,
  object,
} from '@remirror/core-helpers';
import {
  And,
  AttributesParameter,
  EditorSchema,
  EditorView,
  EmptyShape,
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

import { getChangedProperties } from '../helpers';
import {
  BaseExtensionSettings,
  GeneralExtensionTags,
  GetNameUnion,
  MarkExtensionTags,
  NodeExtensionTags,
  PartialProperties,
  PropertiesShape,
  PropertiesUpdateReason,
  SetPropertiesParameter,
  TransactionLifecycleMethod,
} from '../types';

/**
 * Extensions are fundamental to the way that Remirror works by grouping
 * together the functionality and handling the management of similar concerns.
 *
 * @remarks
 *
 *  Extension can adjust editor functionality in any way. Here are some
 *  examples.
 *
 * - How the editor displays certain content, i.e. **bold**, _italic_,
 *   **underline**.
 * - Which commands should be made available e.g. `commands.toggleBold()` to
 *   toggle the weight of the selected text.
 * - Check if a command is currently enabled (i.e a successful dry run) e.g.
 *   `commands.toggleBold.isEnabled()`.
 * - Register Prosemirror `Plugin`s, `keymap`s, `InputRule`s `PasteRule`s,
 *   `Suggestions`, and custom `nodeViews` which affect the behavior of the
 *   editor.
 *
 * There are three types of `Extension`.
 *
 * - `NodeExtension` - For creating Prosemirror nodes in the editor. See
 *   {@link NodeExtension}
 * - `MarkExtension` - For creating Prosemirror marks in the editor. See
 *   {@link MarkExtension}
 * - `PlainExtension` - For behavior which doesn't map to a `ProsemirrorNode` or
 *   `Mark` and as a result doesn't directly affect the Prosemirror `Schema` or
 *   content. See {@link PlainExtension}.
 *
 * This `Extension` is an abstract class that should not be used directly but
 * rather extended to add the intended functionality.
 *
 * ```ts
 * import { PlainExtension } from '@remirror/core';
 *
 * interface AwesomeExtensionSettings {
 *   isAwesome?: boolean;
 * }
 *
 * interface AwesomeExtensionProperties {
 *   id: string;
 * }
 *
 * class AwesomeExtension extends PlainExtension<
 *   AwesomeExtensionSettings,
 *   AwesomeExtensionProperties
 * > {
 *   public static defaultSettings: DefaultExtensionSettings<
 *     AwesomeExtensionSettings
 *   > = {
 *     isAwesome: true,
 *   }
 *   public static defaultProperties: Required<AwesomeExtensionProperties> = {
 *     id: '',
 *   }
 *
 *   get name() { return 'awesome' as const; }
 * }
 * ```
 */
abstract class Extension<Settings extends Shape = EmptyShape, Properties extends Shape = EmptyShape>
  implements PropertiesShape<Properties> {
  /**
   * The default settings for this extension.
   */
  public static readonly defaultSettings = {};

  /**
   * The default properties for this extension.
   */
  public static readonly defaultProperties = {};
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
   * The static settings are automatically merged with the default options of
   * this extension when it is created.
   */
  get settings(): Readonly<Required<Settings & BaseExtensionSettings>> {
    return this.#settings;
  }

  /**
   * The dynamic properties for this extension. Callback handlers and behavioral
   * properties should be placed here.
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
    return freeze(this._store, { requireKeys: true });
  }

  /**
   * This store is can be modified by the extension manager with and lifecycle
   * extension methods.
   *
   * Different properties are added at different times so it's important to
   * check the documentation for each property to know what phase is being
   * added.
   */
  private _store!: Remirror.ExtensionStore;

  /**
   * Private instance of the static settings.
   */
  #settings: Readonly<Required<Settings & BaseExtensionSettings>>;

  /**
   * Private instance of the dynamic properties for this extension.
   */
  #properties: Required<Properties>;

  /**
   * Keep track of whether this extension has been initialized or not.
   */
  #hasInitialized = false;

  constructor(...parameters: ExtensionConstructorParameter<Settings, Properties>) {
    isValidExtensionConstructor(this.constructor);

    const [settings] = parameters;

    this.#settings = deepMerge(
      defaultSettings,
      this.constructor.defaultSettings,
      settings ?? object(),
    );
    this.#properties = { ...this.constructor.defaultProperties, ...settings?.properties };

    // Triggers the `init` properties update for this extension.
    this.setProperties(this.#properties);
    this.#hasInitialized = true;

    this.init();
  }

  /**
   * This method is called by the extension constructor. It is not strictly a
   * lifecycle method since at this point the manager has not yet been
   * instantiated.
   *
   * @remarks
   *
   * It should be used instead of overriding the constructor which can lead to
   * problems.
   *
   * At this point
   * - `this.store` will throw an error since it doesn't yet exist.
   * - `this.type` in `NodeExtension` and `MarkExtension` will also throw an
   *   error since the schema hasn't been created yet.
   */
  protected init() {}

  /**
   * Update the properties with the provided partial value when changed.
   */
  public setProperties(update: Partial<Properties>) {
    const reason: PropertiesUpdateReason = this.#hasInitialized ? 'set' : 'init';
    const previousProperties = this.#properties;

    const { changes, properties } = getChangedProperties({
      previousProperties,
      update,
    });

    // Trigger the update handler so the extension can respond to any relevant property
    // updates.
    this.onSetProperties?.({
      reason,
      changes,
      properties,
      defaultProperties: this.constructor.defaultProperties,
    });

    // The constructor already sets the properties to their default values.
    if (reason === 'init') {
      return;
    }

    // Update the stored properties value.
    this.#properties = properties;
  }

  /**
   * Override to received updates whenever `setProperties` is called. It is an
   * optional abstract method
   *
   * @abstract
   */
  protected onSetProperties?(parameter: SetPropertiesParameter): void;

  /**
   * Reset the extension properties to their default values.
   */
  public resetProperties() {
    const previousProperties = this.#properties;
    const { changes, properties } = getChangedProperties({
      previousProperties,
      update: this.constructor.defaultProperties,
    });

    // Trigger the update handler so that child extension properties can also be
    // updated.
    this.onSetProperties?.({
      reason: 'reset',
      properties,
      changes,
      defaultProperties: this.constructor.defaultProperties,
    });

    // Update the stored properties value.
    this.#properties = properties;
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
    if (this._store) {
      return;
    }

    this._store = store;
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
interface Extension<Settings extends Shape = EmptyShape, Properties extends Shape = EmptyShape>
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
   * behavior is later grouped in the `Manager` and passed as `tag` to each
   * method defined in the `ExtensionFactoryParameter`. It can be used by
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
export type DefaultExtensionSettings<Settings extends Shape> = Omit<
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
  Settings extends Shape = object,
  Properties extends Shape = object
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
  Settings extends Shape = object,
  Properties extends Shape = object
> extends Extension<Settings, Properties> {
  static get [REMIRROR_IDENTIFIER_KEY]() {
    return RemirrorIdentifier.MarkExtensionConstructor as const;
  }

  get [REMIRROR_IDENTIFIER_KEY]() {
    return RemirrorIdentifier.MarkExtension as const;
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
   * For more advanced requirements, it may be possible to create a `nodeView` to
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
   */
  public isActive() {
    return () => isMarkActive({ stateOrTransaction: this.store.getState(), type: this.type });
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
  Settings extends Shape = object,
  Properties extends Shape = object
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
  public isActive() {
    return ({ attrs }: Partial<AttributesParameter>) => {
      return isNodeActive({ state: this.store.getState(), type: this.type, attrs });
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
   *
   * @params hole - a method that is meant to indicate where extra attributes
   * should be placed (if they exist).
   *
   * The `hole` is a function that augments the passed object adding a special
   * `secret` key which is used to insert the extra attributes setter.
   *
   * ```ts
   * import { NodeExtension, SpecHole } from 'remirror/core';
   *
   * class AwesomeExtension extends NodeExtension {
   *   get name() { return 'awesome' as const'; }
   *
   *   createNodeSpec(hole: SpecHole) {
   *     return {
   *       toDOM: (node) => {
   *         return ['p', hole(), 0]
   *       }
   *     }
   *   }
   * }
   * ```
   *
   * The above example will have the `hole()` method call replaced with the
   * extra attributes.
   */
  protected abstract createNodeSpec(hole?: <T extends object>(attrs?: T) => T): NodeExtensionSpec;
}

/**
 * The type which is applicable to any extension instance.
 */
export type AnyExtension = Omit<Extension<Shape, Shape>, keyof Remirror.AnyExtensionOverrides> &
  Remirror.AnyExtensionOverrides;

/**
 * The type which is applicable to any extension instance.
 */
export type AnyExtensionConstructor = ExtensionConstructor<any, any>;

/**
 * The type for any potential PlainExtension.
 */
export type AnyPlainExtension = Omit<
  PlainExtension<any, any>,
  keyof Remirror.AnyExtensionOverrides
> &
  Remirror.AnyExtensionOverrides;

/**
 * The type for any potential NodeExtension.
 */
export type AnyNodeExtension = Omit<NodeExtension<any, any>, keyof Remirror.AnyExtensionOverrides> &
  Remirror.AnyExtensionOverrides;

/**
 * The type for any potential MarkExtension.
 */
export type AnyMarkExtension = Omit<MarkExtension<any, any>, keyof Remirror.AnyExtensionOverrides> &
  Remirror.AnyExtensionOverrides;

/**
 * These are the default options merged into every extension. They can be
 * overridden.
 */
const defaultSettings: Required<BaseExtensionSettings> = {
  priority: null,
  extraAttributes: [],
  exclude: {},
} as any;

/**
 * Set the value for a key of the default settings.
 *
 * @remarks
 *
 * This is a dangerous method since it allows you to mutate the received object.
 * Don't use it unless you absolutely have to.
 *
 * A potential use case is for adding a new default option to all extensions. It
 * shows an example of how to accomplish this in a typesafe way.
 *
 * @example
 *
 * ```ts
 * import { mutateDefaultExtensionSettings } from 'remirror/core';
 *
 * mutateDefaultExtensionSettings((settings) => {
 *   // Set the default value of all extensions to have a property `customSetting` with value `false`.
 *   settings.customSetting = false;
 * })
 *
 * declare global {
 *   namespace Remirror {
 *     interface BaseExtensionSettings {
 *       customSetting?: boolean;
 *     }
 *   }
 * }
 * ```
 *
 * The mutation must happen before any extension have been instantiated.
 */
export function mutateDefaultExtensionSettings(
  mutatorMethod: (defaultSettings: BaseExtensionSettings) => void,
): void {
  mutatorMethod(defaultSettings);
}

/**
 * Determines if the passed value is an extension.
 *
 * @param value - the value to test
 */
export function isExtension(value: unknown): value is AnyExtension {
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
 * Checks that the extension has a valid constructor with the `defaultSettings`
 * and `defaultProperties` defined as static properties.
 */
export function isValidExtensionConstructor(
  Constructor: unknown,
): asserts Constructor is AnyExtensionConstructor {
  invariant(isExtensionConstructor(Constructor), {
    message: 'This is not a valid extension constructor',
    code: ErrorConstant.INVALID_EXTENSION,
  });

  invariant(isPlainObject(Constructor.defaultSettings), {
    message: `No static 'defaultSettings' provided for '${Constructor.name}'.\n`,
    code: ErrorConstant.INVALID_EXTENSION,
  });

  invariant(isPlainObject(Constructor.defaultProperties), {
    message: `No static 'defaultProperties' provided for '${Constructor.name}'.\n`,
    code: ErrorConstant.INVALID_EXTENSION,
  });
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
export type WithProperties<Type extends Shape, Properties extends Shape = object> = And<
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

interface ExtensionConstructor<
  Settings extends Shape = EmptyShape,
  Properties extends Shape = EmptyShape
> extends Function {
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

  /**
   * Defines the `defaultSettings` for all extension instances.
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
   * **Please note**: There is a slight downside when setting up
   * `defaultSettings`. `undefined` is not supported for partial settings at
   * this point in time. As a workaround use `null` as the type and pass it as
   * the value in the default settings.
   *
   * @internal
   */
  readonly defaultSettings: DefaultExtensionSettings<Settings>;

  /**
   * A method that creates the default properties. All properties must have a
   * default property assigned.
   */
  readonly defaultProperties: Required<Properties>;
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
  getStoreKey: <Key extends ManagerStoreKeys>(key: Key) => AnyManagerStore[Key];

  /**
   * Update the store with a specific key.
   */
  setStoreKey: <Key extends ManagerStoreKeys>(key: Key, value: AnyManagerStore[Key]) => void;

  /**
   * The settings passed through to the manager.
   */
  managerSettings: Remirror.ManagerSettings;

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
  extends Omit<CreateLifecycleParameter, 'setExtensionStore'> {}

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
   * This namespace is global and you can use declaration merging to extend and
   * create new types used by the `remirror` project.
   *
   * @remarks
   *
   * The following would add `MyCustomType` to the `Remirror` namespace. Please
   * note that this can only be used for types and interfaces.
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
    interface BaseExtension {}

    /**
     * This interface is global and uses declaration merging to add new methods
     * to the `Extension` class.
     */
    interface ExtensionCreatorMethods<Settings extends Shape, Properties extends Shape = object> {}

    /**
     * An override to for the `AnyExtension` type. If you're extension adds a
     * new property to the `Extension` that is deeply nested or very complex it
     * can break the `AnyExtension` implementation from being compatible with
     * all valid extensions.
     *
     * The keys you provide on this override replace the default `AnyExtension`
     * types include unsafe properties that need to be simplified.
     *
     * An example is the `constructor` property which makes it impossible to
     * find a common interface between extensions with different settings and
     * properties. By setting the `constructor` to a much simpler override all
     * `Extension`'s are now assignable to the `AnyExtension type again.`
     */
    interface AnyExtensionOverrides {
      constructor: AnyExtensionConstructor;
    }
  }
}

/* eslint-enable @typescript-eslint/member-ordering */
/* eslint-enable @typescript-eslint/explicit-member-accessibility */

// Make the abstract extension available but only as a type.
export type { Extension };
