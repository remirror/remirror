import {
  __INTERNAL_REMIRROR_IDENTIFIER_KEY__,
  ErrorConstant,
  ExtensionPriority,
  ManagerPhase,
  RemirrorIdentifier,
} from '@remirror/core-constants';
import {
  freeze,
  invariant,
  isIdentifierOfType,
  isNullOrUndefined,
  isRemirrorType,
  object,
} from '@remirror/core-helpers';
import { EditorSchema, EditorView } from '@remirror/core-types';
import {
  createDocumentNode,
  CreateDocumentNodeParameter,
  getTextSelection,
} from '@remirror/core-utils';
import { EditorState } from '@remirror/pm/state';

import { BuiltinPreset } from '../builtins';
import {
  AnyExtension,
  AnyExtensionConstructor,
  AnyManagerStore,
  CreateLifecycleMethod,
  DestroyLifecycleMethod,
  GetMarkNameUnion,
  GetNodeNameUnion,
  isMarkExtension,
  isNodeExtension,
  isPlainExtension,
  ManagerStoreKeys,
  ViewLifecycleMethod,
} from '../extension';
import {
  AnyCombinedUnion,
  AnyPreset,
  AnyPresetConstructor,
  InferCombinedExtensions,
  InferCombinedPresets,
  SchemaFromCombined,
} from '../preset';
import { privacySymbol } from '../privacy';
import {
  GetConstructor,
  GetExtensions,
  StateUpdateLifecycleMethod,
  StateUpdateLifecycleParameter,
} from '../types';
import { transformCombinedUnion } from './remirror-manager-helpers';

/**
 * The `Manager` has multiple hook phases which are able to hook into the
 * extension manager flow and add new functionality to the editor.
 *
 * The `ExtensionEventMethod`s
 *
 * - onCreate - when the extension manager is created and after the schema is
 *   made available.
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
export class RemirrorManager<Combined extends AnyCombinedUnion> {
  /**
   * A static method to create the editor manager from an object.
   */
  static fromObject<ExtensionUnion extends AnyExtension, PresetUnion extends AnyPreset>({
    extensions,
    presets,
    settings = {},
  }: RemirrorManagerParameter<ExtensionUnion, PresetUnion>) {
    const builtInPreset = new BuiltinPreset();

    return new RemirrorManager<ExtensionUnion | PresetUnion | BuiltinPreset>(
      [...extensions, ...presets, builtInPreset],
      { ...settings, privacy: privacySymbol },
    );
  }

  /**
   * The main static method for creating a manager.
   */
  static create<Combined extends AnyCombinedUnion>(
    combined: Combined[],
    settings: Remirror.ManagerSettings = {},
  ) {
    const builtInPreset = new BuiltinPreset();

    return new RemirrorManager<Combined | BuiltinPreset>([...combined, builtInPreset], {
      ...settings,
      privacy: privacySymbol,
    });
  }

  /**
   * Utility getter for storing the base method parameter which is available to
   * all extensions.
   */
  #extensionStore: Remirror.ExtensionStore;

  #extensions: ReadonlyArray<this['~E']>;
  #extensionMap: WeakMap<AnyExtensionConstructor, this['~E']>;

  #presets: ReadonlyArray<this['~P']>;
  #presetMap: WeakMap<GetConstructor<this['~P']>, this['~P']>;

  /**
   * The extension manager store.
   */
  #store: Remirror.ManagerStore<Combined> = this.createInitialStore();

  /**
   * The stage the manager is currently running.
   */
  #phase: ManagerPhase = ManagerPhase.None;

  /**
   * The settings used to create the manager.
   */
  #settings: Remirror.ManagerSettings;

  /**
   * The original combined array passed into the editor..
   */
  #combined: readonly Combined[];

  /**
   * When true this identifies this as the first state update since the view was
   * added to the editor.
   */
  #firstStateUpdate = true;

  /**
   * Store the handlers that will be run when for each event method.
   */
  #handlers: {
    create: CreateLifecycleMethod[];
    view: ViewLifecycleMethod[];
    update: StateUpdateLifecycleMethod[];
    destroy: DestroyLifecycleMethod[];
  } = {
    create: [],
    view: [],
    update: [],
    destroy: [],
  };

  /**
   * Returns true if the manager has been destroyed.
   */
  get destroyed() {
    return this.#phase === ManagerPhase.Destroy;
  }

  /**
   * Identifies this as a `Manager`.
   *
   * @internal
   */
  get [__INTERNAL_REMIRROR_IDENTIFIER_KEY__]() {
    return RemirrorIdentifier.Manager as const;
  }

  /**
   * The extensions stored by this manager
   */
  get extensions(): ReadonlyArray<GetExtensions<this>> {
    return this.#extensions;
  }

  /**
   * The preset stored by this manager
   */
  get presets() {
    return this.#presets;
  }

  /**
   * Get the original combined presets used to create this manager.
   */
  get combined() {
    return freeze(this.#combined);
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
  private constructor(
    combined: readonly Combined[],
    { privacy, ...settings }: SettingsWithPrivacy = {},
  ) {
    this.#settings = settings;
    this.#combined = combined;

    invariant(privacy === privacySymbol, {
      message: `The extension manager can only be invoked via one of it's static methods. e.g 'RemirrorManager.create([...extensions])'.`,
      code: ErrorConstant.NEW_EDITOR_MANAGER,
    });

    const { extensions, extensionMap, presets, presetMap } = transformCombinedUnion<Combined>(
      combined,
      settings,
    );

    this.#extensions = freeze(extensions);
    this.#extensionMap = extensionMap;
    this.#presets = freeze(presets);
    this.#presetMap = presetMap;

    this.#extensionStore = this.createExtensionStore();

    this.setupLifecycleHandlers();

    this.#phase = ManagerPhase.Create;

    for (const handler of this.#handlers.create) {
      handler(this.#extensions);
    }
  }

  /**
   * Loops through all extensions to set up the lifecycle handlers.
   */
  private setupLifecycleHandlers() {
    for (const preset of this.#presets) {
      preset.setExtensionStore(this.#extensionStore);
    }

    const nodeNames: string[] = [];
    const markNames: string[] = [];
    const plainNames: string[] = [];

    this.#extensionStore.nodeNames = nodeNames;
    this.#extensionStore.markNames = markNames;
    this.#extensionStore.plainNames = plainNames;

    for (const extension of this.#extensions) {
      extension.setStore(this.#extensionStore);

      const createHandler = extension.onCreate;
      const viewHandler = extension.onView;
      const stateUpdateHandler = extension.onStateUpdate;
      const destroyHandler = extension.onDestroy;

      if (createHandler) {
        this.#handlers.create.push(createHandler);
      }

      if (viewHandler) {
        this.#handlers.view.push(viewHandler);
      }

      if (stateUpdateHandler) {
        this.#handlers.update.push(stateUpdateHandler);
      }

      if (destroyHandler) {
        this.#handlers.destroy.push(destroyHandler);
      }

      if (isNodeExtension(extension)) {
        nodeNames.push(extension.name);
      }

      if (isMarkExtension(extension)) {
        markNames.push(extension.name);
      }

      if (isPlainExtension(extension)) {
        plainNames.push(extension.name);
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
   * A method to set values in the extension store which is made available to
   * extension.
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
   * Create the initial store.
   */
  private createInitialStore() {
    const store: Remirror.ManagerStore<Combined> = object();
    return store;
  }

  /**
   * Create the initial store.
   */
  private createExtensionStore() {
    const store: Remirror.ExtensionStore = object();

    Object.defineProperties(store, {
      extensions: {
        get: () => this.#extensions,
        enumerable: true,
      },
      phase: {
        get: () => this.#phase,
        enumerable: true,
      },
      view: {
        get: () => this.view,
        enumerable: true,
      },
      managerSettings: {
        get: () => freeze(this.#settings),
        enumerable: true,
      },
      getState: {
        value: this.getState,
        enumerable: true,
      },
      updateState: {
        value: this.updateState,
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
  addView(view: EditorView<this['~Sch']>) {
    if (this.#phase >= ManagerPhase.EditorView) {
      // Do nothing since a view has already been added.
      return this;
    }
    // invariant(this.#phase < ManagerPhase.EditorView, {code:
    //   ErrorConstant.MANAGER_PHASE_ERROR, message: 'A view has already been
    //   added to this manager. A view should only be added once.',
    // });

    this.#firstStateUpdate = true;

    // Update the lifecycle phase.
    this.#phase = ManagerPhase.EditorView;

    // Store the view.
    this.#store.view = view;

    for (const handler of this.#handlers.view) {
      handler(this.#extensions as readonly AnyExtension[], view);
    }

    return this;
  }

  /* Public Methods */

  /**
   * Create the editor state from content passed to this extension manager.
   */
  createState(parameter: Omit<CreateDocumentNodeParameter, 'schema'>) {
    const { content, doc: docParameter, stringHandler, onError, selection } = parameter;
    const { schema, plugins } = this.store;

    const doc = createDocumentNode({
      content,
      doc: docParameter,
      schema,
      stringHandler,
      onError,
      selection,
    });

    const state = EditorState.create({
      schema,
      doc,
      plugins,
    });

    if (!selection) {
      return state;
    }

    const tr = state.tr.setSelection(getTextSelection(selection, state.doc));

    return state.applyTransaction(tr).state;
  }

  /**
   * Update the state of the view and trigger the `onStateUpdate` lifecyle
   * method as well.
   */
  updateState = (state: EditorState<this['~Sch']>) => {
    const previousState = this.getState();

    this.view.updateState(state);
    this.onStateUpdate({ previousState, state });
  };

  /**
   * This method should be called by the view layer every time the state is
   * updated.
   *
   * An example usage of this is within the collaboration plugin.
   */
  onStateUpdate(parameter: Omit<StateUpdateLifecycleParameter, 'firstUpdate'>) {
    const firstUpdate = this.#firstStateUpdate;

    this.#extensionStore.currentState = parameter.state;
    this.#extensionStore.previousState = parameter.previousState;

    if (this.#firstStateUpdate) {
      this.#phase = ManagerPhase.Runtime;
      this.#firstStateUpdate = false;
    }

    for (const handler of this.#handlers.update) {
      handler({ ...parameter, firstUpdate });
    }
  }

  /**
   * Get the extension instance matching the provided constructor from the
   * manager.
   *
   * This will throw an error if non existent.
   */
  getExtension<ExtensionConstructor extends AnyExtensionConstructor>(
    Constructor: ExtensionConstructor,
  ): InstanceType<ExtensionConstructor> {
    const extension = this.#extensionMap.get(Constructor);

    // Throws an error if attempting to get an extension which is not present in
    // the manager.
    invariant(extension, {
      code: ErrorConstant.INVALID_MANAGER_EXTENSION,
      message: `'${Constructor.name}' doesn't exist within this manager. Make sure it is properly added before attempting to use it.`,
    });

    return extension as InstanceType<ExtensionConstructor>;
  }

  /**
   * Get the requested preset from the manager. This will throw if the preset doesn't
   * exist within this manager.
   */
  getPreset<PresetConstructor extends AnyPresetConstructor>(
    Constructor: PresetConstructor,
  ): InstanceType<PresetConstructor> {
    const preset = this.#presetMap.get(Constructor);

    // Throws an error if attempting to retrieve a preset which is not present
    // in the manager.
    invariant(preset, {
      code: ErrorConstant.INVALID_MANAGER_PRESET,
      message: `'${Constructor.name}' doesn't exist within this manager. Make sure it is properly added before attempting to use it.`,
    });

    return preset as InstanceType<PresetConstructor>;
  }

  /**
   * Recreate the manager.
   *
   * TODO: Think about the following.
   * - What about the state stored in the extensions and presets, does this need to be
   * recreated as well?
   */
  clone<ExtraCombined extends AnyCombinedUnion>(
    combined: ExtraCombined[],
    settings: Remirror.ManagerSettings = {},
  ): RemirrorManager<Combined | ExtraCombined> {
    const currentCombined = this.#combined.map((e) => e.clone(e.initialOptions as any));

    return RemirrorManager.create([...currentCombined, ...combined], settings) as RemirrorManager<
      Combined | ExtraCombined
    >;
  }

  /**
   * Called when removing the manager and all preset and extensions.
   */
  destroy() {
    this.#phase = ManagerPhase.Destroy;
    // TODO: prevent `dispatchTransaction` from being called again
    for (const onDestroy of this.#handlers.destroy) {
      onDestroy(this.#extensions);
    }
  }
}

export type AnyRemirrorManager = RemirrorManager<AnyCombinedUnion>;

/**
 * Checks to see whether the provided value is an `Manager`.
 *
 * @param value - the value to check
 */
export function isRemirrorManager<Combined extends AnyCombinedUnion = AnyCombinedUnion>(
  value: unknown,
): value is RemirrorManager<Combined> {
  return isRemirrorType(value) && isIdentifierOfType(value, RemirrorIdentifier.Manager);
}

export interface RemirrorManagerParameter<
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

interface SettingsWithPrivacy extends Remirror.ManagerSettings {
  /**
   * A symbol value that prevents the RemirrorManager constructor from being
   * called directly.
   *
   * @internal
   */
  privacy?: symbol;
}

export type GetCombined<Manager extends AnyRemirrorManager> = Manager['~EP'];

interface RemirrorManagerConstructor<Combined extends AnyCombinedUnion>
  extends Function,
    Remirror.RemirrorManagerConstructor {
  fromObject: (
    parameter: RemirrorManagerParameter<
      InferCombinedExtensions<Combined>,
      InferCombinedPresets<Combined>
    >,
  ) => RemirrorManager<
    InferCombinedExtensions<Combined> | InferCombinedPresets<Combined> | BuiltinPreset
  >;
  create: (combined: Combined) => RemirrorManager<Combined | BuiltinPreset>;
}

export interface RemirrorManager<Combined extends AnyCombinedUnion> {
  /**
   * The constructor for the editor manager.
   */
  constructor: RemirrorManagerConstructor<Combined>;

  /**
   * Pseudo property which is a small hack to store the type of the extension
   * union.
   */
  ['~E']: InferCombinedExtensions<Combined>;

  /**
   * Pseudo property which is a small hack to store the type of the presets
   * available from this manager..
   */
  ['~P']: InferCombinedPresets<Combined>;

  /**
   * Pseudo property which is a small hack to store the type of the schema
   * available from this manager..
   */
  ['~Sch']: SchemaFromCombined<Combined>;

  /**
   * `NodeNames`
   *
   * Type inference hack for node extension names. This is the only way I know
   * to store types on a class.
   *
   * @internal
   */
  ['~N']: GetNodeNameUnion<this['~E']>;

  /**
   * `MarkNames`
   *
   * Type inference hack for mark extension names. This is the only way I know
   * to store types on a class.
   *
   * @internal
   */
  ['~M']: GetMarkNameUnion<this['~E']>;

  ['~EP']: Combined;
}

declare global {
  namespace Remirror {
    /**
     * Extend this to add extra static methods to the
     * `RemirrorManagerConstructor`.
     */
    interface RemirrorManagerConstructor {}

    /**
     * Settings which can be passed into the manager.
     */
    interface ManagerSettings {
      /**
       * Set the extension priority for extension's by their name.
       */
      priority?: Record<string, ExtensionPriority>;

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
    interface ManagerStore<Combined extends AnyCombinedUnion> {
      /**
       * The editor view stored by this instance.
       */
      view: EditorView<SchemaFromCombined<Combined>>;
    }

    /**
     * The initialization params which are passed by the view layer into the
     * extension manager. This can be added to by the requesting framework
     * layer.
     */
    interface ManagerInitializationParameter<
      ExtensionUnion extends AnyExtension,
      PresetUnion extends AnyPreset
    > {}

    interface ExtensionStore {
      /**
       * The list of all extensions included in the editor.
       */
      readonly extensions: AnyExtension[];

      /**
       * The stage the manager is currently at.
       */
      readonly phase: ManagerPhase;

      /**
       * A helper method for retrieving the state of the editor
       */
      readonly getState: () => EditorState<EditorSchema>;

      /**
       * Allow extensions to trigger an update in the prosemirror state. This
       * should only be used in rarely as it is easy to get
       * in trouble without the necessary thought.
       */
      readonly updateState: (state: EditorState<EditorSchema>) => void;

      /**
       * The view available to extensions once `addView` has been called on the
       * `RemirrorManager` instance.
       */
      readonly view: EditorView<EditorSchema>;

      /**
       * The latest state.
       */
      currentState: EditorState<EditorSchema>;

      /**
       * The previous state. Will be undefined when the view is first created.
       */
      previousState?: EditorState<EditorSchema>;

      /**
       * The settings passed to the manager.
       */
      readonly managerSettings: ManagerSettings;

      /**
       * The names of every node extension.
       */
      nodeNames: readonly string[];

      /**
       * The names of every mark extension.
       */
      markNames: readonly string[];

      /**
       * The names of every plain extension.
       */
      plainNames: readonly string[];

      /**
       * Get the value of a key from the manager store.
       */
      getStoreKey: <Key extends ManagerStoreKeys>(key: Key) => AnyManagerStore[Key];

      /**
       * Update the store with a specific key.
       */
      setStoreKey: <Key extends ManagerStoreKeys>(key: Key, value: AnyManagerStore[Key]) => void;

      /**
       * Set a custom manager method parameter.
       */
      setExtensionStore: <Key extends keyof Remirror.ExtensionStore>(
        key: Key,
        value: Remirror.ExtensionStore[Key],
      ) => void;
    }
  }
}
