import { EditorState } from 'prosemirror-state';

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
import {
  EditorSchema,
  EditorStateParameter,
  EditorView,
  ProsemirrorPlugin,
  TransactionParameter,
} from '@remirror/core-types';
import { createDocumentNode, CreateDocumentNodeParameter } from '@remirror/core-utils';

import { BuiltInExtensions, BuiltinPreset } from '../builtins';
import {
  AnyExtension,
  AnyExtensionConstructor,
  CreateLifecycleMethodParameter,
  CreateLifecycleMethodReturn,
  ExtensionFromConstructor,
  ExtensionLifecycleMethods,
  HelpersFromExtensions,
  InitializeLifecycleMethodParameter,
  InitializeLifecycleMethodReturn,
  SchemaFromExtension,
  setDefaultExtensionSettings,
  ViewLifecycleMethodReturn,
} from '../extension';
import { AnyPreset, PresetFromConstructor } from '../preset';
import { GetConstructor } from '../types';
import {
  getParameterWithType,
  ignoreFunctions,
  ManagerPhase,
  transformExtensionOrPreset as transformExtensionOrPresetList,
} from './editor-manager-helpers';

/**
 * Checks to see whether the provided value is an `Manager`.
 *
 * @param value - the value to check
 */
export function isEditorManager(value: unknown): value is EditorManager {
  return isRemirrorType(value) && isIdentifierOfType(value, RemirrorIdentifier.Manager);
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
export class EditorManager<
  ExtensionUnion extends AnyExtension = AnyExtension,
  PresetUnion extends AnyPreset<ExtensionUnion> = AnyPreset
> {
  /**
   * A static method for creating a manager.
   */
  public static of<
    ExtensionUnion extends AnyExtension,
    PresetUnion extends AnyPreset<ExtensionUnion>
  >(
    extensionOrPresetList: Array<ExtensionUnion | PresetUnion>,
    settings: Remirror.ManagerSettings,
  ) {
    return new EditorManager<ExtensionUnion, PresetUnion>(extensionOrPresetList, settings);
  }

  /* eslint-disable @typescript-eslint/explicit-member-accessibility */

  /**
   * Utility getter for storing the base method parameter which is passed to the
   * extension methods
   */
  #methodParameter: Remirror.ManagerMethodParameter<
    SchemaFromExtension<ExtensionUnion>
  > = this.createInitialMethodParameter();

  #extensions: ReadonlyArray<ExtensionUnion | BuiltInExtensions>;
  #extensionMap: WeakMap<AnyExtensionConstructor, ExtensionUnion | BuiltInExtensions>;

  #presets: ReadonlyArray<PresetUnion | BuiltinPreset>;
  #presetMap: WeakMap<GetConstructor<PresetUnion | BuiltinPreset>, PresetUnion | BuiltinPreset>;

  /**
   * The extension manager store.
   */
  #store: Remirror.ManagerStore<ExtensionUnion> = this.createInitialStore();

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
    create: CreateLifecycleMethodReturn[];
    initialize: InitializeLifecycleMethodReturn[];
    view: ViewLifecycleMethodReturn[];
    transaction: Array<NonNullable<ExtensionLifecycleMethods['onTransaction']>>;
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
  get extensions() {
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
  get tags() {
    return this.#store.tags;
  }

  /**
   * A shorthand way of retrieving the editor view.
   */
  get view(): EditorView<SchemaFromExtension<ExtensionUnion>> {
    return this.view;
  }

  /**
   * Creates the extension manager which is used to simplify the management of
   * the prosemirror editor.
   *
   * This should not be called directly if you want to use prioritized
   * extensions. Instead use `Manager.create`.
   */
  private constructor(
    extensionOrPresetList: Array<ExtensionUnion | PresetUnion>,
    settings: Remirror.ManagerSettings,
  ) {
    this.#settings = settings;

    const { extensions, extensionMap, presets, presetMap } = transformExtensionOrPresetList<
      ExtensionUnion,
      PresetUnion
    >(extensionOrPresetList);

    this.#extensions = freeze(extensions);
    this.#extensionMap = extensionMap;
    this.#presets = freeze(presets);
    this.#presetMap = presetMap;

    this.setupLifecycleHandlers();

    this.#phase = ManagerPhase.Create;

    this.beforeCreate();

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
    const createParameter: CreateLifecycleMethodParameter = {
      ...omit(viewParameter, ['getParameter']),
      setDefaultExtensionSettings,
      setManagerMethodParameter: (key, value) => {
        invariant(this.#phase <= ManagerPhase.Create, {
          code: ErrorConstant.MANAGER_PHASE_ERROR,
          message:
            '`setManagerMethodParameter` should only be called during the `onCreate` lifecycle hook. Make sure to only call it within the returned methods.',
        });

        this.#methodParameter[key] = value;
      },
    };

    for (const extension of this.#extensions) {
      const createHandler = extension.parameter.onCreate?.(createParameter);
      const initializeHandler = extension.parameter.onInitialize?.(initializeParameter);
      const viewHandler = extension.parameter.onView?.(viewParameter);
      const transactionHandler = extension.parameter.onTransaction;
      const destroyHandler = extension.parameter.onDestroy;

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

  private get initializeParameter(): InitializeLifecycleMethodParameter {
    return {
      getParameter: (extension) => {
        invariant(this.#phase >= ManagerPhase.Initialize, {
          code: ErrorConstant.MANAGER_PHASE_ERROR,
          message: '`getParameter` should only be called within the returned methods scope.',
        });

        return getParameterWithType(extension, { ...this.#methodParameter });
      },
      addPlugins: this.addPlugins,
      getStoreKey: this.getStoreKey,
      setStoreKey: this.setStoreKey,
      managerSettings: this.#settings,
    };
  }

  /**
   * Set the store key.
   */
  private readonly setStoreKey = <Key extends keyof Remirror.ManagerStore>(
    key: Key,
    value: Remirror.ManagerStore[Key],
  ) => {
    invariant(this.#phase > ManagerPhase.Initialize, {
      code: ErrorConstant.MANAGER_PHASE_ERROR,
      message: '`setStoreKey` should only be called within the returned methods scope.',
    });

    this.#store[key] = value;
  };

  private readonly getStoreKey = <Key extends keyof Remirror.ManagerStore>(
    key: Key,
  ): Remirror.ManagerStore[Key] => {
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
   * Called before the extension loop of the initialization phase.
   */
  private beforeCreate() {
    for (const { beforeExtensionLoop } of this.#handlers.create) {
      beforeExtensionLoop?.();
    }
  }

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
   * Called before the extension loop of the initialization phase.
   */
  private beforeInitialize() {
    for (const { beforeExtensionLoop } of this.#handlers.initialize) {
      beforeExtensionLoop?.();
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
   * Called after the extension loop of the initialization phase.
   */
  private beforeView(view: EditorView<EditorSchema>) {
    for (const { beforeExtensionLoop } of this.#handlers.view) {
      beforeExtensionLoop?.(view);
    }
  }

  /**
   * Called during the extension loop of the initialization phase.
   */
  private onViewExtensionLoop(
    extension: this['extensions'][number],
    view: EditorView<EditorSchema>,
  ) {
    for (const { forEachExtension } of this.#handlers.view) {
      forEachExtension?.(extension, view);
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

    this.beforeInitialize();

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
    const store: Remirror.ManagerStore<ExtensionUnion> = object();
    return store;
  }

  /**
   * Create the initial store.
   */
  private createInitialMethodParameter() {
    const methodParameter: Remirror.ManagerMethodParameter<SchemaFromExtension<
      ExtensionUnion
    >> = object();

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
  public addView(view: EditorView<SchemaFromExtension<ExtensionUnion>>) {
    this.#phase = ManagerPhase.AddView;
    this.#store.view = view;
    this.beforeView(view);

    for (const extension of this.#extensions) {
      this.onViewExtensionLoop(extension, view);
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
  public onTransaction(parameter: ManagerTransactionHandlerParameter) {
    for (const onTransaction of this.#handlers.transaction) {
      onTransaction({ ...parameter, ...this.#methodParameter, view: this.store.view });
    }
  }

  /**
   * Get the extension instance matching the provided constructor from the
   */
  public getExtension<ExtensionConstructor extends GetConstructor<this['extensions'][number]>>(
    Constructor: ExtensionConstructor,
  ): ExtensionFromConstructor<ExtensionConstructor> {
    const extension = this.#extensionMap.get(Constructor);

    // Throws an error if attempting to get an extension which is not present
    // in the manager.
    invariant(extension, { code: ErrorConstant.INVALID_MANAGER_EXTENSION });

    return extension as ExtensionFromConstructor<typeof Constructor>;
  }

  /**
   * Get the preset from the editor.
   */
  public getPreset<PresetConstructor extends GetConstructor<PresetUnion>>(
    Constructor: PresetConstructor,
  ): PresetFromConstructor<PresetConstructor> {
    const preset = this.#presetMap.get(Constructor);

    // Throws an error if attempting to get a preset which is not present
    // in the manager.
    invariant(preset, { code: ErrorConstant.INVALID_MANAGER_PRESET });

    return preset as PresetFromConstructor<PresetConstructor>;
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

export interface ManagerTransactionHandlerParameter
  extends TransactionParameter,
    EditorStateParameter {}

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
    interface ManagerStore<ExtensionUnion extends AnyExtension = any> {
      /**
       * The editor view stored by this instance.
       */
      view: EditorView<SchemaFromExtension<ExtensionUnion>>;

      /**
       * The helpers defined within this manager.
       */
      helpers: HelpersFromExtensions<ExtensionUnion>;
    }

    /**
     * The initialization params which are passed by the view layer into the
     * extension manager. This can be added to by the requesting framework layer.
     */
    interface ManagerInitializationParameter<ExtensionUnion extends AnyExtension = any> {}
  }
}
