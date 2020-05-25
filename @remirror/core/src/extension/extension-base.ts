/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable @typescript-eslint/explicit-member-accessibility */
import {
  __INTERNAL_REMIRROR_IDENTIFIER_KEY__,
  ErrorConstant,
  ExtensionPriority,
  ExtensionTag,
  RemirrorIdentifier,
} from '@remirror/core-constants';
import { freeze, invariant, isIdentifierOfType, isRemirrorType } from '@remirror/core-helpers';
import {
  AttributesParameter,
  EditorSchema,
  EditorView,
  EmptyShape,
  MarkExtensionSpec,
  MarkType,
  NodeExtensionSpec,
  NodeType,
  ProsemirrorPlugin,
  Replace,
  Shape,
  ValidOptions,
} from '@remirror/core-types';
import { isMarkActive, isNodeActive } from '@remirror/core-utils';

import {
  BaseExtensionOptions,
  GeneralExtensionTags,
  GetNameUnion,
  MarkExtensionTags,
  NodeExtensionTags,
  TransactionLifecycleMethod,
} from '../types';
import {
  AnyBaseClassOverrides,
  BaseClass,
  BaseClassConstructor,
  ConstructorParameter,
  DefaultOptions,
  isValidConstructor,
} from './base-class';

/**
 * Auto infers the parameter for the constructor. If there is a
 * required static option then the TypeScript compiler will error if nothing is
 * passed in.
 */
export type ExtensionConstructorParameter<Options extends ValidOptions> = ConstructorParameter<
  Options,
  BaseExtensionOptions
>;

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
 *   public static defaultOptions: DefaultExtensionSettings<
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
abstract class Extension<Options extends ValidOptions = EmptyShape> extends BaseClass<
  Options,
  BaseExtensionOptions
> {
  /**
   * The default priority for this family of extensions.
   */
  public static readonly defaultPriority = ExtensionPriority.Default;

  /**
   * The priority level for this instance of the extension.
   */
  get priority(): ExtensionPriority {
    return this.options.priority ?? this.constructor.defaultPriority;
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

  constructor(...parameters: ExtensionConstructorParameter<Options>) {
    super(isValidExtensionConstructor, defaultOptions, ...parameters);
  }

  /**
   * Check if the type of this extension's constructor matches the type of the
   * provided constructor.
   */
  public isOfType<Type extends AnyExtensionConstructor>(
    Constructor: Type,
  ): this is InstanceType<Type> {
    return this.constructor === (Constructor as unknown);
  }

  /**
   * Pass a reference to the globally shared `ExtensionStore` for this extension.
   *
   * @remarks
   *
   * The extension store allows extensions to access important variables without
   * complicating their creator methods.
   *
   * ```ts
   * import { PlainExtension } from 'remirror/core';
   *
   * class Awesome extends PlainExtension {
   *   customMethod() {
   *     if (this.store.view.hasFocus()) {
   *       console.log('dance dance dance');
   *     }
   *   }
   * }
   * ```
   *
   * This should only be called by the `EditorManager`.
   *
   * @internal
   * @nonVirtual
   */
  public setStore(store: Remirror.ExtensionStore) {
    if (this._store) {
      return;
    }

    this._store = store;
  }
}

/**
 * Declaration merging since the constructor property can't be defined on the
 * actual class.
 */
interface Extension<Options extends ValidOptions = EmptyShape>
  extends ExtensionLifecycleMethods,
    Remirror.ExtensionCreatorMethods<Options>,
    Remirror.BaseExtension {
  constructor: ExtensionConstructor<Options>;

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
}

/**
 * Get the expected type signature for the `defaultOptions`. Requires that
 * every optional setting key (except for keys which are defined on the
 * `BaseExtensionOptions`) has a value assigned.
 */
export type DefaultExtensionOptions<Options extends ValidOptions> = DefaultOptions<
  Options,
  BaseExtensionOptions
>;

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

/**
 * Create a plain extension which doesn't directly map to Prosemirror nodes or
 * marks.
 *
 * Plain extensions are a great way to add custom behavior to your editor.
 */
export abstract class PlainExtension<Options extends ValidOptions = EmptyShape> extends Extension<
  Options
> {
  static get [__INTERNAL_REMIRROR_IDENTIFIER_KEY__]() {
    return RemirrorIdentifier.PlainExtensionConstructor as const;
  }

  get [__INTERNAL_REMIRROR_IDENTIFIER_KEY__]() {
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
export abstract class MarkExtension<Options extends ValidOptions = EmptyShape> extends Extension<
  Options
> {
  static get [__INTERNAL_REMIRROR_IDENTIFIER_KEY__]() {
    return RemirrorIdentifier.MarkExtensionConstructor as const;
  }

  get [__INTERNAL_REMIRROR_IDENTIFIER_KEY__]() {
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

  constructor(...parameters: ExtensionConstructorParameter<Options>) {
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
export abstract class NodeExtension<Options extends ValidOptions = EmptyShape> extends Extension<
  Options
> {
  static get [__INTERNAL_REMIRROR_IDENTIFIER_KEY__]() {
    return RemirrorIdentifier.NodeExtensionConstructor as const;
  }

  get [__INTERNAL_REMIRROR_IDENTIFIER_KEY__]() {
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

  constructor(...parameters: ExtensionConstructorParameter<Options>) {
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
export type AnyExtension = Replace<Extension<Shape>, Remirror.AnyExtensionOverrides>;

/**
 * The type which is applicable to any extension instance.
 */
export type AnyExtensionConstructor = Replace<
  ExtensionConstructor<any>,
  // eslint-disable-next-line @typescript-eslint/prefer-function-type
  { new (...args: any[]): AnyExtension }
>;

/**
 * The type for any potential PlainExtension.
 */
export type AnyPlainExtension = Omit<PlainExtension<any>, keyof Remirror.AnyExtensionOverrides> &
  Remirror.AnyExtensionOverrides;

/**
 * The type for any potential NodeExtension.
 */
export type AnyNodeExtension = Omit<NodeExtension<any>, keyof Remirror.AnyExtensionOverrides> &
  Remirror.AnyExtensionOverrides;

/**
 * The type for any potential MarkExtension.
 */
export type AnyMarkExtension = Omit<MarkExtension<any>, keyof Remirror.AnyExtensionOverrides> &
  Remirror.AnyExtensionOverrides;

/**
 * These are the default options merged into every extension. They can be
 * overridden.
 */
const defaultOptions: Required<BaseExtensionOptions> = {
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
 *     interface BaseExtensionOptions {
 *       customSetting?: boolean;
 *     }
 *   }
 * }
 * ```
 *
 * The mutation must happen before any extension have been instantiated.
 */
export function mutateDefaultExtensionOptions(
  mutatorMethod: (defaultOptions: BaseExtensionOptions) => void,
): void {
  mutatorMethod(defaultOptions);
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
 * Checks that the extension has a valid constructor with the `defaultOptions`
 * and `defaultProperties` defined as static properties.
 */
export function isValidExtensionConstructor(
  Constructor: unknown,
): asserts Constructor is AnyExtensionConstructor {
  const code = ErrorConstant.INVALID_EXTENSION;

  invariant(isExtensionConstructor(Constructor), {
    message: 'This is not a valid extension constructor',
    code,
  });

  isValidConstructor(Constructor, code);
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

interface ExtensionConstructor<Options extends ValidOptions = EmptyShape>
  extends BaseClassConstructor<Options, BaseExtensionOptions> {
  new (...parameters: ExtensionConstructorParameter<Options>): Extension<Options>;

  /**
   * The default priority level for all instance of this extension.
   *
   * @defaultValue `ExtensionPriority.Default`
   */
  readonly defaultPriority: ExtensionPriority;
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
    interface AnyExtensionOverrides extends AnyBaseClassOverrides {
      constructor: AnyExtensionConstructor;
    }
  }
}

/* eslint-enable @typescript-eslint/member-ordering */
/* eslint-enable @typescript-eslint/explicit-member-accessibility */

// Make the abstract extension available but only as a type.
export type { Extension };
