import {
  __INTERNAL_REMIRROR_IDENTIFIER_KEY__,
  ErrorConstant,
  ManagerPhase,
  RemirrorIdentifier,
} from '@remirror/core-constants';
import {
  freeze,
  invariant,
  isEqual,
  isIdentifierOfType,
  isNullOrUndefined,
  isRemirrorType,
  object,
} from '@remirror/core-helpers';
import { EditorSchema, EditorView } from '@remirror/core-types';
import { createDocumentNode, CreateDocumentNodeParameter } from '@remirror/core-utils';
import { EditorState } from '@remirror/pm/state';

import { BuiltinPreset } from '../builtins';
import {
  AnyExtension,
  AnyExtensionConstructor,
  AnyManagerStore,
  CreateLifecycleReturn,
  GetExtensionUnion,
  GetMarkNameUnion,
  GetNodeNameUnion,
  InitializeLifecycleReturn,
  ManagerStoreKeys,
  SchemaFromExtensionUnion,
  ViewLifecycleReturn,
} from '../extension';
import { AnyPreset, AnyPresetConstructor } from '../preset';
import { privacySymbol } from '../privacy';
import {
  GetConstructor,
  GetExtensions,
  TransactionLifecycleMethod,
  TransactionLifecycleParameter,
} from '../types';
import {
  ignoreFunctions,
  transformExtensionOrPreset as transformExtensionOrPresetList,
} from './editor-manager-helpers';

/**
 * The `Manager` has multiple hook phases which are able to hook into the
 * extension manager flow and add new functionality to the editor.
 *
 * The `ExtensionEventMethod`s
 *
 * - onConstruct - when the extension manager is created and after the schema is
 *   made available.
 * - onInit - when the editor manager is initialized within the component
 * - onView - when the view has been received from the dom ref.
 */

/**
 * A class to manage the extensions and prosemirror interactions of our editor.
 *
 * @remarks
 *
 * The extension manager has three phases of Initialization:
 *
 * - Construction - This takes in all the extensions and creates the schema.
 *
 * ```ts
 * const manager = Manager.create([ new DocExtension(), new TextExtension(), new ParagraphExtension()])
 * ```
 *
 * - Initialize Getters - This connects the extension manager to the lazily
 *   evaluated `getState` method and the `portalContainer`. Once these are
 *   created and allows access to its data.
 *
 * ```ts
 * manager.init({ getState: () => state, portalContainer: new PortalContainer })
 *
 * manager.data.
 * ```
 *
 * - Initialize View - This connects the extension manager to the EditorView and
 *   creates the actions (which need access to the view).
 *
 * ```ts
 * manager.initView(new EditorView(...))
 * manager.data.actions
 * ```
 */
export class EditorManager<ExtensionUnion extends AnyExtension, PresetUnion extends AnyPreset> {
  /**
   * The main static method for creating a manager.
   */
  public static create<ExtensionUnion extends AnyExtension, PresetUnion extends AnyPreset>({
    extensions = [] as ExtensionUnion[],
    presets = [] as PresetUnion[],
    settings = {},
  }: EditorManagerParameter<ExtensionUnion, PresetUnion>) {
    const builtInPreset = new BuiltinPreset();

    return new EditorManager<ExtensionUnion, PresetUnion | typeof builtInPreset>({
      extensions,
      presets: [...presets, builtInPreset],
      settings: { ...settings, privacy: privacySymbol },
    });
  }

  /**
   * Pseudo property which is a small hack to store the type of the extension
   * union.
   */
  public ['~E']!: ExtensionUnion | GetExtensions<PresetUnion>;

  /**
   * Pseudo property which is a small hack to store the type of the presets
   * available from this manager..
   */
  public ['~P']!: PresetUnion;

  /**
   * Pseudo property which is a small hack to store the type of the schema
   * available from this manager..
   */
  public ['~Sch']!: SchemaFromExtensionUnion<this['~E']>;

  /**
   * `NodeNames`
   *
   * Type inference hack for node extension names.
   * This is the only way I know to store types on a class.
   *
   * @internal
   */
  public readonly ['~N']!: GetNodeNameUnion<this['~E']>;

  /**
   * `MarkNames`
   *
   * Type inference hack for mark extension names.
   * This is the only way I know to store types on a class.
   *
   * @internal
   */
  public readonly ['~M']!: GetMarkNameUnion<this['~E']>;

  /* eslint-disable @typescript-eslint/explicit-member-accessibility */

  /**
   * Utility getter for storing the base method parameter which is available to
   * all extensions.
   */
  #extensionStore: Remirror.ExtensionStore<SchemaFromExtensionUnion<this['~E']>>;

  #extensions: ReadonlyArray<this['~E']>;
  #extensionMap: WeakMap<AnyExtensionConstructor, this['~E']>;

  #presets: ReadonlyArray<this['~P']>;
  #presetMap: WeakMap<GetConstructor<this['~P']>, this['~P']>;

  /**
   * The extension manager store.
   */
  #store: Remirror.ManagerStore<ExtensionUnion, PresetUnion> = this.createInitialStore();

  /**
   * The stage the manager is currently running.
   */
  #phase: ManagerPhase = ManagerPhase.None;

  /**
   * The settings used to create the manager.
   */
  #settings: Remirror.ManagerSettings;

  /**
   * Store the handlers that will be run when for each event method.
   */
  #handlers: {
    create: CreateLifecycleReturn[];
    initialize: InitializeLifecycleReturn[];
    view: ViewLifecycleReturn[];
    transaction: TransactionLifecycleMethod[];
    destroy: Array<() => void>;
  } = { initialize: [], transaction: [], view: [], create: [], destroy: [] };

  /* eslint-enable @typescript-eslint/explicit-member-accessibility */

  /**
   * Identifies this as a `Manager`.
   *
   * @internal
   */
  get [__INTERNAL_REMIRROR_IDENTIFIER_KEY__]() {
    return RemirrorIdentifier.Manager;
  }

  /**
   * The extensions stored by this manager
   */
  get extensions(): ReadonlyArray<ExtensionUnion | GetExtensionUnion<PresetUnion>> {
    return this.#extensions;
  }

  /**
   * The preset stored by this manager
   */
  get presets() {
    return this.#presets;
  }

  /**
   * Get the extension manager store which is accessible at initialization.
   */
  get store() {
    return freeze(this.#store);
  }

  /**
   * Returns the stored nodes
   */
  get nodes() {
    return this.#store.nodes;
  }

  /**
   * Returns the store marks.
   */
  get marks() {
    return this.#store.marks;
  }

  /**
   * A shorthand method for retrieving the schema for this extension manager
   * from the data.
   */
  get schema() {
    return this.#store.schema;
  }

  /**
   * A shorthand getter for retrieving the tags from the extension manager.
   */
  get extensionTags() {
    return this.#store.tags;
  }

  /**
   * A shorthand way of retrieving the editor view.
   */
  get view() {
    return this.#store.view;
  }

  /**
   * Retrieve the settings used when creating the manager.
   */
  get settings() {
    return this.#settings;
  }

  /**
   * Creates the extension manager which is used to simplify the management of
   * the prosemirror editor.
   *
   * This should not be called directly if you want to use prioritized
   * extensions. Instead use `Manager.create`.
   */
  private constructor(parameter: EditorManagerConstructorParameter<ExtensionUnion, PresetUnion>) {
    this.#settings = parameter.settings ?? {};

    invariant(parameter.settings?.privacy === privacySymbol, {
      message: `The extension manager can only be invoked via one of it's static methods. e.g 'EditorManager.create([...extensions])'.`,
      code: ErrorConstant.NEW_EDITOR_MANAGER,
    });

    const { extensions, extensionMap, presets, presetMap } = transformExtensionOrPresetList<
      ExtensionUnion,
      PresetUnion
    >([...parameter.extensions, ...parameter.presets]);

    this.#extensions = freeze(extensions);
    this.#extensionMap = extensionMap;
    this.#presets = freeze(presets);
    this.#presetMap = presetMap;

    this.#extensionStore = this.createExtensionStore();

    this.setupLifecycleHandlers();

    this.#phase = ManagerPhase.Create;

    for (const extension of this.#extensions) {
      this.onCreateExtensionLoop(extension);
    }

    this.afterCreate();

    this.initialize();
  }

  /**
   * Loops through all extensions to set up the lifecycle handlers.
   */
  private setupLifecycleHandlers() {
    for (const extension of this.#extensions) {
      extension.setStore(this.#extensionStore);

      const createHandler = extension.onCreate?.();
      const initializeHandler = extension.onInitialize?.();
      const viewHandler = extension.onView?.();
      const transactionHandler = extension.onTransaction;
      const destroyHandler = extension.onDestroy;

      if (createHandler) {
        this.#handlers.create.push(createHandler);
      }

      if (initializeHandler) {
        this.#handlers.initialize.push(initializeHandler);
      }

      if (viewHandler) {
        this.#handlers.view.push(viewHandler);
      }

      if (transactionHandler) {
        this.#handlers.transaction.push(transactionHandler);
      }

      if (destroyHandler) {
        this.#handlers.destroy.push(destroyHandler);
      }
    }
  }

  /**
   * Set the store key.
   */
  private readonly setStoreKey = <Key extends ManagerStoreKeys>(
    key: Key,
    value: AnyManagerStore[Key],
  ) => {
    this.#store[key] = value;
  };

  private readonly getStoreKey = <Key extends ManagerStoreKeys>(key: Key): AnyManagerStore[Key] => {
    const value = this.#store[key];

    invariant(!isNullOrUndefined(value), {
      code: ErrorConstant.MANAGER_PHASE_ERROR,
      message: '`getStoreKey` should not be called before the values are available.',
    });

    return value;
  };

  /**
   * A method to set values in the extension store which is made available to extension.
   *
   * **NOTE** This method should only be used in the `onCreate` extension method
   * or it will throw an error.
   */
  private readonly setExtensionStore = <Key extends keyof Remirror.ExtensionStore>(
    key: Key,
    value: Remirror.ExtensionStore[Key],
  ) => {
    invariant(this.#phase <= ManagerPhase.Create, {
      code: ErrorConstant.MANAGER_PHASE_ERROR,
      message:
        '`setExtensionStore` should only be called during the `onCreate` lifecycle hook. Make sure to only call it within the returned methods.',
    });

    this.#extensionStore[key] = value;
  };

  /**
   * Called after the extension loop of the initialization phase.
   */
  private afterCreate() {
    for (const { afterExtensionLoop } of this.#handlers.create) {
      afterExtensionLoop?.();
    }
  }

  /**
   * Called during the extension loop of the initialization phase.
   */
  private onCreateExtensionLoop(extension: this['extensions'][number]) {
    for (const { forEachExtension } of this.#handlers.create) {
      forEachExtension?.(extension);
    }
  }

  /**
   * Called after the extension loop of the initialization phase.
   */
  private afterInitialize() {
    for (const { afterExtensionLoop } of this.#handlers.initialize) {
      afterExtensionLoop?.();
    }
  }

  /**
   * Called during the extension loop of the initialization phase.
   */
  private onInitializeExtensionLoop(extension: this['~E']) {
    for (const { forEachExtension } of this.#handlers.initialize) {
      forEachExtension?.(extension);
    }
  }

  /**
   * Called during the extension loop of the initialization phase.
   */
  private onViewExtensionLoop(extension: AnyExtension) {
    for (const { forEachExtension } of this.#handlers.view) {
      forEachExtension?.(extension);
    }
  }

  /**
   * Called after the extension loop of the initialization phase.
   */
  private afterView(view: EditorView<EditorSchema>) {
    for (const { afterExtensionLoop } of this.#handlers.view) {
      afterExtensionLoop?.(view);
    }
  }

  /**
   * Initialize the extension manager with important data.
   *
   * This is called by the view layer and provides
   */
  private initialize() {
    this.#phase = ManagerPhase.Initialize;

    for (const extension of this.#extensions) {
      this.onInitializeExtensionLoop(extension);
    }

    this.afterInitialize();

    // this.#store.helpers = this.helpers();
  }

  /**
   * Create the initial store.
   */
  private createInitialStore() {
    const store: Remirror.ManagerStore<ExtensionUnion, PresetUnion> = object();
    return store;
  }

  /**
   * Create the initial store.
   */
  private createExtensionStore() {
    const store: Remirror.ExtensionStore<SchemaFromExtensionUnion<this['~E']>> = object();

    Object.defineProperties(store, {
      phase: {
        get: () => {
          return this.#phase;
        },
        enumerable: true,
      },
      view: {
        get: () => {
          return this.view;
        },
        enumerable: true,
      },
      managerSettings: {
        get: () => {
          return freeze(this.#settings);
        },
        enumerable: true,
      },
      getState: {
        value: this.getState,
        enumerable: true,
      },
    });

    store.getStoreKey = this.getStoreKey;
    store.setStoreKey = this.setStoreKey;
    store.setExtensionStore = this.setExtensionStore;

    return store;
  }

  /**
   * A state getter method which is passed into the params.
   */
  private readonly getState = () => {
    invariant(this.#phase >= ManagerPhase.EditorView, {
      code: ErrorConstant.MANAGER_PHASE_ERROR,
      message:
        '`getState` can only be called after the view has been added to the manager. Avoid using it in the outer scope of `creatorMethods`.',
    });

    return this.view.state as EditorState;
  };

  /**
   * Stores the editor view on the manager
   *
   * @param view - the editor view
   */
  public addView(view: EditorView<SchemaFromExtensionUnion<this['~E']>>) {
    invariant(this.#phase === ManagerPhase.Initialize, {
      message: '`addView` called before manager was initialized.',
      code: ErrorConstant.MANAGER_PHASE_ERROR,
    });

    // Update the lifecycle phase.
    this.#phase = ManagerPhase.EditorView;

    // Store the view.
    this.#store.view = view as EditorView;

    // Store the view, state and helpers for extensions

    for (const extension of this.#extensions) {
      this.onViewExtensionLoop(extension);
    }

    this.afterView(view);

    this.#phase = ManagerPhase.Runtime;
  }

  /* Public Methods */

  /**
   * Create the editor state from content passed to this extension manager.
   */
  public createState({
    content,
    doc,
    stringHandler,
    fallback,
  }: Omit<CreateDocumentNodeParameter, 'schema'>) {
    const { schema, plugins } = this.store;
    return EditorState.create({
      schema,
      doc: createDocumentNode({
        content,
        doc,
        schema,
        stringHandler,
        fallback,
      }),
      plugins,
    });
  }

  /**
   * Checks whether two manager's are equal. Can be used to determine whether a
   * change in props has caused anything to actually change and prevent a
   * rerender.
   *
   * Managers are equal when
   * - They have the same number of extensions
   * - Same order of extensions
   * - Each extension has the same options (ignoring methods)
   *
   * @param otherManager - the value to test against
   */
  public isEqual(otherManager: unknown) {
    if (!isEditorManager(otherManager)) {
      return false;
    }

    const manager = otherManager;

    if (this.extensions.length !== manager.extensions.length) {
      return false;
    }

    for (let ii = 0; ii <= this.extensions.length - 1; ii++) {
      const extension = this.extensions[ii];
      const otherExtension = manager.extensions[ii];

      if (
        extension.constructor === otherExtension.constructor &&
        isEqual(ignoreFunctions(extension.options), ignoreFunctions(otherExtension.options))
      ) {
        continue;
      }
      return false;
    }

    return true;
  }

  /**
   * A handler which allows the extension to respond to each transaction without
   * needing to register a plugin.
   *
   * An example usage of this is within the collaboration plugin.
   */
  public onTransaction(parameter: TransactionLifecycleParameter) {
    Object.defineProperties(this.#extensionStore, {
      currentState: {
        get: () => parameter.state,
        enumerable: true,
      },
      previousState: {
        get: () => parameter.previousState,
        enumerable: true,
      },
    });

    for (const handler of this.#handlers.transaction) {
      handler(parameter);
    }
  }

  /**
   * Get the extension instance matching the provided constructor from the manager.
   *
   * This will throw an error if non existent.
   */
  public getExtension<ExtensionConstructor extends AnyExtensionConstructor>(
    Constructor: ExtensionConstructor,
  ): InstanceType<ExtensionConstructor> {
    const extension = this.#extensionMap.get(Constructor);

    // Throws an error if attempting to get an extension which is not present in
    // the manager.
    invariant(extension, { code: ErrorConstant.INVALID_MANAGER_EXTENSION });

    return extension as InstanceType<ExtensionConstructor>;
  }

  /**
   * Get the preset from the editor.
   */
  public getPreset<PresetConstructor extends AnyPresetConstructor>(
    Constructor: PresetConstructor,
  ): InstanceType<PresetConstructor> {
    const preset = this.#presetMap.get(Constructor);

    // Throws an error if attempting to retrieve a preset which is not present
    // in the manager.
    invariant(preset, { code: ErrorConstant.INVALID_MANAGER_PRESET });

    return preset as InstanceType<PresetConstructor>;
  }

  /**
   * Called when removing the manager and all preset and extensions.
   */
  public destroy() {
    for (const onDestroy of this.#handlers.destroy) {
      onDestroy();
    }
  }
}

export type AnyEditorManager = EditorManager<any, any>;

/**
 * Checks to see whether the provided value is an `Manager`.
 *
 * @param value - the value to check
 */
export function isEditorManager(value: unknown): value is AnyEditorManager {
  return isRemirrorType(value) && isIdentifierOfType(value, RemirrorIdentifier.Manager);
}

export interface EditorManagerParameter<
  ExtensionUnion extends AnyExtension,
  PresetUnion extends AnyPreset
> {
  /**
   * The extensions so use when creating the editor.
   *
   * @remarks
   *
   * This is a required even when just an empty array to improve type inference.
   */
  extensions: ExtensionUnion[];

  /**
   * The presets to include with the editor.
   *
   * @remarks
   *
   * This is required even when just an empty array to improve type inference.
   */
  presets: PresetUnion[];

  /**
   * Settings to customise the behaviour of the editor.
   */
  settings?: Remirror.ManagerSettings;
}

interface EditorManagerConstructorParameter<
  ExtensionUnion extends AnyExtension,
  PresetUnion extends AnyPreset
> extends EditorManagerParameter<ExtensionUnion, PresetUnion> {
  settings?: Remirror.ManagerSettings & {
    /**
     * A symbol value that prevents the EditorManager constructor from being called
     * directly.
     *
     * @internal
     */
    privacy: symbol;
  };
}

declare global {
  namespace Remirror {
    /**
     * Settings which can be passed into the manager.
     */
    interface ManagerSettings {
      /**
       * An object which excludes certain functionality from all extensions
       * within the manager.
       */
      exclude?: ExcludeOptions;
    }

    /**
     * Describes the object where the extension manager stores it's data.
     *
     * @remarks
     *
     * Since this is a global namespace, you can extend the store if your
     * extension is modifying the shape of the `Manager.store` property.
     */
    interface ManagerStore<ExtensionUnion extends AnyExtension, PresetUnion extends AnyPreset> {
      /**
       * The editor view stored by this instance.
       */
      view: EditorView<SchemaFromExtensionUnion<ManagerExtensions<ExtensionUnion, PresetUnion>>>;
    }

    /**
     * The extension which are available on an `EditorManager` based on the
     * passed in type params.
     */
    type ManagerExtensions<ExtensionUnion extends AnyExtension, PresetUnion extends AnyPreset> =
      | ExtensionUnion
      | GetExtensionUnion<PresetUnion>;

    /**
     * The initialization params which are passed by the view layer into the
     * extension manager. This can be added to by the requesting framework
     * layer.
     */
    interface ManagerInitializationParameter<
      ExtensionUnion extends AnyExtension,
      PresetUnion extends AnyPreset
    > {}

    interface ExtensionStore<Schema extends EditorSchema = EditorSchema> {
      /**
       * The stage the manager is currently at.
       */
      readonly phase: ManagerPhase;

      /**
       * A helper method for retrieving the state of the editor
       *
       * Availability: **return scope** - `onView`
       */
      readonly getState: () => EditorState<Schema>;

      /**
       * The view available to extensions once `addView` has been called on the
       * `EditorManager` instance.
       *
       * Availability: **return scope** - `onView`
       */
      readonly view: EditorView<Schema>;

      /**
       * The latest state.
       *
       * Availability: **return scope** - `onView`
       */
      readonly currentState: EditorState<Schema>;

      /**
       * The previous state. Will be undefined when the view is first created.
       *
       * Availability: **return scope** - `onView`
       */
      readonly previousState?: EditorState<Schema>;

      /**
       * The settings passed to the manager.
       *
       * Availability: **outer scope** - `onCreate`
       */
      readonly managerSettings: ManagerSettings;

      /**
       * Get the value of a key from the manager store.
       *
       * Availability: **outer scope** - `onCreate`
       */
      getStoreKey: <Key extends ManagerStoreKeys>(key: Key) => AnyManagerStore[Key];

      /**
       * Update the store with a specific key.
       *
       * Availability: **outer scope** - `onCreate`
       */
      setStoreKey: <Key extends ManagerStoreKeys>(key: Key, value: AnyManagerStore[Key]) => void;

      /**
       * Set a custom manager method parameter.
       *
       * Availability: **outer scope** - `onCreate`
       */
      setExtensionStore: <Key extends keyof Remirror.ExtensionStore>(
        key: Key,
        value: Remirror.ExtensionStore[Key],
      ) => void;
    }
  }
}
