import {
  ErrorConstant,
  REMIRROR_IDENTIFIER_KEY,
  RemirrorIdentifier,
} from '@remirror/core-constants';
import {
  freeze,
  invariant,
  isEqual,
  isIdentifierOfType,
  isRemirrorType,
  object,
  omit,
} from '@remirror/core-helpers';
import { EditorSchema, EditorView, ProsemirrorPlugin } from '@remirror/core-types';
import { createDocumentNode, CreateDocumentNodeParameter } from '@remirror/core-utils';
import { EditorState } from '@remirror/pm/state';

import { BuiltinPreset } from '../builtins';
import {
  AnyExtension,
  AnyExtensionConstructor,
  AnyManagerStore,
  CreateLifecycleParameter,
  CreateLifecycleReturn,
  GetExtensionUnion,
  InitializeLifecycleParameter,
  InitializeLifecycleReturn,
  ManagerStoreKeys,
  SchemaFromExtensionUnion,
  setDefaultExtensionSettings,
  ViewLifecycleReturn,
} from '../extension';
import { AnyPreset } from '../preset';
import {
  GetConstructor,
  TransactionLifecycleMethod,
  TransactionLifecycleParameter,
} from '../types';
import {
  ignoreFunctions,
  ManagerPhase,
  transformExtensionOrPreset as transformExtensionOrPresetList,
} from './editor-manager-helpers';

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
   */
  extensions: ExtensionUnion[];

  /**
   * The presets to include with the editor.
   */
  presets: PresetUnion[];

  /**
   * Settings to customise the behaviour of the editor.
   */
  settings?: Remirror.ManagerSettings;
}

/**
 * The `Manager` has multiple hook phases which are able to hook into
 * the extension manager flow and add new functionality to the editor.
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
   * A static method for creating a manager.
   */
  public static of<ExtensionUnion extends AnyExtension, PresetUnion extends AnyPreset>({
    extensions = [] as ExtensionUnion[],
    presets = [] as PresetUnion[],
    settings = {},
  }: Partial<EditorManagerParameter<ExtensionUnion, PresetUnion>>) {
    const builtInPreset = BuiltinPreset.of();
    return new EditorManager<ExtensionUnion, PresetUnion | typeof builtInPreset>({
      extensions,
      presets: [...presets, builtInPreset],
      settings,
    });
  }

  /**
   * Pseudo property which is a small hack to store the type of the extension union.
   */
  public ['~E']!: ExtensionUnion;

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

  /* eslint-disable @typescript-eslint/explicit-member-accessibility */

  /**
   * Utility getter for storing the base method parameter which is available to
   * all extensions.
   */
  #extensionStore: Remirror.ExtensionStore<
    SchemaFromExtensionUnion<this['~E']>
  > = this.createExtensionStore();

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
  get [REMIRROR_IDENTIFIER_KEY]() {
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
    return this.#store.extensionTags;
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
  private constructor(parameter: EditorManagerParameter<ExtensionUnion, PresetUnion>) {
    this.#settings = parameter.settings ?? {};

    const { extensions, extensionMap, presets, presetMap } = transformExtensionOrPresetList<
      ExtensionUnion,
      PresetUnion
    >([...parameter.extensions, ...parameter.presets]);

    this.#extensions = freeze(extensions);
    this.#extensionMap = extensionMap;
    this.#presets = freeze(presets);
    this.#presetMap = presetMap;

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
    const initializeParameter = this.initializeParameter;
    const viewParameter = omit(initializeParameter, ['addPlugins']);
    const createParameter: CreateLifecycleParameter = {
      ...viewParameter,
      setDefaultExtensionSettings,
      setExtensionStore: (key, value) => {
        invariant(this.#phase <= ManagerPhase.Create, {
          code: ErrorConstant.MANAGER_PHASE_ERROR,
          message:
            '`setExtensionStore` should only be called during the `onCreate` lifecycle hook. Make sure to only call it within the returned methods.',
        });

        this.#extensionStore[key] = value;
      },
    };

    for (const extension of this.#extensions) {
      extension.setStore(this.#extensionStore);

      const createHandler = extension.onCreate?.({ ...createParameter });
      const initializeHandler = extension.onInitialize?.({ ...initializeParameter });
      const viewHandler = extension.onView?.({ ...viewParameter });
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

  private get initializeParameter(): Omit<InitializeLifecycleParameter, 'settings' | 'properties'> {
    return {
      addPlugins: this.addPlugins,
      getStoreKey: this.getStoreKey,
      setStoreKey: this.setStoreKey,
      managerSettings: this.#settings,
    };
  }

  /**
   * Set the store key.
   */
  private readonly setStoreKey = <Key extends ManagerStoreKeys>(
    key: Key,
    value: AnyManagerStore[Key],
  ) => {
    invariant(this.#phase > ManagerPhase.None, {
      code: ErrorConstant.MANAGER_PHASE_ERROR,
      message: '`setStoreKey` should only be called within the returned methods scope.',
    });

    this.#store[key] = value;
  };

  private readonly getStoreKey = <Key extends ManagerStoreKeys>(key: Key): AnyManagerStore[Key] => {
    invariant(this.#phase >= ManagerPhase.Initialize, {
      code: ErrorConstant.MANAGER_PHASE_ERROR,
      message: '`getStoreKey` should only be called within the returned methods scope.',
    });

    return this.#store[key];
  };

  private readonly addPlugins = (...plugins: ProsemirrorPlugin[]) => {
    this.#store.plugins.push(...plugins);
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
  private onInitializeExtensionLoop(extension: this['extensions'][number]) {
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
    const methodParameter: Remirror.ExtensionStore<SchemaFromExtensionUnion<this['~E']>> = object();

    /**
     * A state getter method which is passed into the params.
     */
    methodParameter.getState = () => {
      invariant(this.#phase >= ManagerPhase.AddView, {
        code: ErrorConstant.MANAGER_PHASE_ERROR,
        message:
          '`getState` can only be called after the view has been added to the manager. Avoid using it in the outer scope of `creatorMethods`.',
      });

      return this.view.state;
    };

    return methodParameter;
  }

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

    this.#phase = ManagerPhase.AddView;
    this.#store.view = view;
    this.#extensionStore.view = view;

    for (const extension of this.#extensions) {
      this.onViewExtensionLoop(extension);
    }

    this.afterView(view);

    this.#phase = ManagerPhase.Done;
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
        isEqual(ignoreFunctions(extension.settings), ignoreFunctions(otherExtension.settings))
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
    for (const handler of this.#handlers.transaction) {
      handler(parameter);
    }
  }

  /**
   * Get the extension instance matching the provided constructor from the
   */
  public getExtension<ExtensionConstructor extends this['~E']['constructor']>(
    Constructor: ExtensionConstructor,
  ): InstanceType<ExtensionConstructor> {
    const extension = this.#extensionMap.get(Constructor);

    // Throws an error if attempting to get an extension which is not present
    // in the manager.
    invariant(extension, { code: ErrorConstant.INVALID_MANAGER_EXTENSION });

    return extension as InstanceType<ExtensionConstructor>;
  }

  /**
   * Get the preset from the editor.
   */
  public getPreset<PresetConstructor extends PresetUnion['constructor']>(
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

declare global {
  namespace Remirror {
    /**
     * Settings which can be passed into the manager.
     */
    interface ManagerSettings<ExtensionUnion extends AnyExtension = any> {
      /**
       * An object which excludes certain functionality from all extensions within
       * the manager.
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
     * The extension which are available on an `EditorManager` based on the passed
     * in type params.
     */
    type ManagerExtensions<ExtensionUnion extends AnyExtension, PresetUnion extends AnyPreset> =
      | ExtensionUnion
      | GetExtensionUnion<PresetUnion>;

    /**
     * The initialization params which are passed by the view layer into the
     * extension manager. This can be added to by the requesting framework layer.
     */
    interface ManagerInitializationParameter<
      ExtensionUnion extends AnyExtension,
      PresetUnion extends AnyPreset
    > {}

    interface ExtensionStore<Schema extends EditorSchema = EditorSchema> {
      /**
       * The view available to extensions once `addView` has been called on the
       * `EditorManager` instance.
       */
      view: EditorView<Schema>;
    }
  }
}
