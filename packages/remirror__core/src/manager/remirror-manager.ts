import { createNanoEvents, Unsubscribe } from 'nanoevents';
import {
  __INTERNAL_REMIRROR_IDENTIFIER_KEY__,
  ErrorConstant,
  ExtensionPriority,
  ManagerPhase,
  RemirrorIdentifier,
} from '@remirror/core-constants';
import {
  freeze,
  getLazyArray,
  includes,
  invariant,
  isNullOrUndefined,
  isString,
  object,
} from '@remirror/core-helpers';
import type {
  Dispose,
  EditorSchema,
  EditorView,
  MarkExtensionSpec,
  NodeExtensionSpec,
  PrimitiveSelection,
  ProsemirrorNode,
  RemirrorContentType,
  RenderEnvironment,
  Replace,
  Simplify,
  Transaction,
} from '@remirror/core-types';
import {
  createDocumentNode,
  CustomDocumentProps,
  getDocument,
  getTextSelection,
  InvalidContentHandler,
  isIdentifierOfType,
  isRemirrorType,
  NamedStringHandlers,
  StringHandler,
  StringHandlerProps,
} from '@remirror/core-utils';
import { EditorState } from '@remirror/pm/state';

import { BuiltinPreset, builtinPreset, CombinedTags, CommandsExtension } from '../builtins';
import type {
  AnyExtension,
  AnyExtensionConstructor,
  AnyManagerStore,
  GetExtensions,
  GetMarkNameUnion,
  GetNameUnion,
  GetNodeNameUnion,
  GetPlainNameUnion,
  GetSchema,
  ManagerStoreKeys,
} from '../extension';
import type { BaseFramework, FrameworkOutput } from '../framework';
import type { StateUpdateLifecycleProps } from '../types';
import {
  extractLifecycleMethods,
  ManagerLifecycleHandlers,
  transformExtensions,
} from './remirror-manager-helpers';

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
 * A class to manage the extensions and prosemirror interactions within the
 * editor.
 *
 * @remarks
 *
 * The RemirrorManager enables the lifecycle methods of the extensions by
 * calling each method in the distinct phases of the lifecycle.
 *
 * - `onCreate` - This happens when the manager is constructed. It calls on the
 *   extension which have an `onCreate` method and allows them to do their work.
 *
 * For the built in methods, this is when the `SchemaExtension` creates the
 * Schema and when the `TagsExtension` combines the tags for the editor
 * instance.
 *
 * ```ts
 * const manager = Manager.create(() => [
 *   new DocExtension(),
 *   new TextExtension(),
 *   new ParagraphExtension(),
 * ])
 * ```
 *
 * At this point all the `onCreate` methods have been called. Including the
 * `onCreate` for the `Schema`.
 *
 * - `onView` - This is called the framework instance connects the
 *   `RemirrorManager` to the ProseMirror EditorView.
 *
 * ```ts
 * manager.addView(new EditorView(...))
 * manager.store.commands.insertText('Hello world');.
 * ```
 *
 * - [[`onStateUpdate`]] - This is the method called every time the ProseMirror
 *   state changes. Both the extensions and the `Framework` listen to this event
 *   and can provide updates in response.
 */
export class RemirrorManager<Extension extends AnyExtension> {
  /**
   * Create the manager for your `Remirror` editor.
   */
  static create<Extension extends AnyExtension>(
    extensions: Extension[] | ExtensionTemplate<Extension>,
    settings: Remirror.ManagerSettings = {},
  ): RemirrorManager<Extension | BuiltinPreset> {
    return new RemirrorManager<Extension | BuiltinPreset>(
      [...getLazyArray(extensions), ...builtinPreset(settings.builtin)],
      settings,
    );
  }

  /**
   * Utility getter for storing the base method props which is available to
   * all extensions.
   */
  #extensionStore: Remirror.ExtensionStore;

  /**
   * The named string handlers
   */
  #stringHandlers: NamedStringHandlers = object();

  /**
   * The extension manager store.
   */
  #store: Remirror.ManagerStore<Extension> = object();

  /**
   * All the extensions being used within this editor.
   */
  #extensions: ReadonlyArray<GetExtensions<Extension>>;

  /**
   * The map of extension constructor to their extension counterparts. This is
   * what makes the `getExtension` method possible.
   */
  #extensionMap: WeakMap<AnyExtensionConstructor, GetExtensions<Extension>>;

  /**
   * The stage the manager is currently running.
   */
  #phase: ManagerPhase = ManagerPhase.None;

  /**
   * The settings used to create the manager.
   */
  #settings: Remirror.ManagerSettings;

  /**
   * When true this identifies this as the first state update since the view was
   * added to the editor.
   */
  #firstStateUpdate = true;

  /**
   * Store the handlers that will be run when for each event method.
   */
  #handlers: ManagerLifecycleHandlers = {
    create: [],
    view: [],
    update: [],
    destroy: [],
  };

  /**
   * The disposers for the editor.
   */
  #disposers: Array<() => void> = [];

  /**
   * The event listener which allows consumers to subscribe to the different
   * events without using props.
   */
  #events = createNanoEvents<ManagerEvents>();

  /**
   * The active framework for this manager if it exists.
   */
  #framework?: BaseFramework<Extension>;

  /**
   * A method for disposing the state update event listeners on the active
   * framework.
   */
  #disposeFramework?: Dispose;

  /**
   * Identifies this as a `Manager`.
   *
   * @internal
   */
  get [__INTERNAL_REMIRROR_IDENTIFIER_KEY__](): RemirrorIdentifier.Manager {
    return RemirrorIdentifier.Manager;
  }

  /**
   * Returns `true` if the manager has been destroyed.
   */
  get destroyed(): boolean {
    return this.#phase === ManagerPhase.Destroy;
  }

  /**
   * `true` when the view has been added to the UI layer and the editor is
   * running.
   */
  get mounted(): boolean {
    return this.#phase >= ManagerPhase.EditorView && this.#phase < ManagerPhase.Destroy;
  }

  /**
   * Retrieve the framework output.
   *
   * This be undefined if the manager hasn't been provided to a framework yet
   * the manager.
   *
   * With synchronous frameworks this means that it should only be accessed
   * after the manager has been applied to the editor creation function.
   *
   * For frameworks like React it is only available when the manager is provided
   * to the `Remirror` component and after the very first render. This means it
   * is available within the `onRef` callback.
   *
   * ```tsx
   * import React, { useEffect } from 'react';
   * import { useRemirror, Remirror } from '@remirror/react';
   *
   * const Editor = () => {
   *   const { manager } = useRemirror();
   *
   *   const callback = () => {
   *     return manager.output; // ✅ This is fine.
   *   }
   *
   *   useEffect(() => {
   *     log(manager.output); // ✅  This is also fine.
   *   }, []);
   *
   *   log(manager.output); // ❌ This will be undefined on the first render.
   *
   *   return <Remirror manager={manager} />
   * }
   * ```
   */
  get output(): FrameworkOutput<Extension> | undefined {
    return this.#framework?.frameworkOutput;
  }

  /**
   * Returns true when a framework is attached to the manager.
   *
   * This can be used to check if it is safe to call `manager.output`.
   */
  get frameworkAttached(): boolean {
    return !!this.#framework;
  }

  /**
   * The extensions stored by this manager
   */
  get extensions(): ReadonlyArray<GetExtensions<Extension>> {
    return this.#extensions;
  }

  /**
   * The registered string handlers provided by the extensions.
   *
   * By default this includes `html` and `plainText`
   */
  get stringHandlers(): NamedStringHandlers {
    return this.#stringHandlers;
  }

  /**
   * Get the extension manager store which is accessible at initialization.
   */
  get store(): Remirror.ManagerStore<Extension> {
    return freeze(this.#store);
  }

  /**
   * Provides access to the extension store.
   */
  get extensionStore(): Remirror.ExtensionStore {
    return freeze(this.#extensionStore);
  }

  /**
   * Shorthand access to the active transaction from the manager. This is the
   * shared transaction available to all commands and should be used when you
   * need to make your commands chainable.
   *
   * If working with react and setting up your editor as a controlled component
   * then this is the preferred way to run custom commands, otherwise your
   * commands will end up being non-chainable and be overwritten by anything
   * that comes after.
   */
  get tr(): Transaction<GetSchema<Extension>> {
    return this.getExtension(CommandsExtension).transaction;
  }

  /**
   * Returns the stored nodes
   */
  get nodes(): Record<this['~N'], NodeExtensionSpec> {
    return this.#store.nodes;
  }

  /**
   * Returns the store marks.
   */
  get marks(): Record<this['~M'], MarkExtensionSpec> {
    return this.#store.marks;
  }

  /**
   * A shorthand method for retrieving the schema for this extension manager
   * from the data.
   */
  get schema(): this['~Sch'] {
    return this.#store.schema;
  }

  /**
   * A shorthand getter for retrieving the tags from the extension manager.
   */
  get extensionTags(): Readonly<CombinedTags<GetNameUnion<Extension>>> {
    return this.#store.tags;
  }

  /**
   * A shorthand way of retrieving the editor view.
   */
  get view(): EditorView<GetSchema<Extension>> {
    return this.#store.view;
  }

  /**
   * Retrieve the settings used when creating the manager.
   */
  get settings(): Remirror.ManagerSettings {
    return this.#settings;
  }

  /**
   * The document to use for rendering and outputting HTML.
   */
  get document(): Document {
    return this.#settings.document ?? getDocument(this.#settings.forceEnvironment);
  }

  /**
   * Creates the extension manager which is used to simplify the management of
   * the prosemirror editor.
   *
   * This is set to private to encourage using `RemirrorManager.create`
   * instead of the `new` keyword.
   */
  private constructor(
    initialExtension: readonly Extension[],
    settings: Remirror.ManagerSettings = {},
  ) {
    const { extensions, extensionMap } = transformExtensions<Extension>(initialExtension, settings);

    this.#settings = settings;
    this.#extensions = freeze(extensions);
    this.#extensionMap = extensionMap;
    this.#extensionStore = this.createExtensionStore();
    this.#phase = ManagerPhase.Create;

    this.setupLifecycleHandlers();

    for (const handler of this.#handlers.create) {
      const disposer = handler();

      if (disposer) {
        this.#disposers.push(disposer);
      }
    }
  }

  /**
   * Loops through all extensions to set up the lifecycle handlers.
   */
  private setupLifecycleHandlers(): void {
    const store = this.#extensionStore;
    const handlers = this.#handlers;

    const nodeNames: string[] = [];
    const markNames: string[] = [];
    const plainNames: string[] = [];

    // The names are stored as readonly arrays - which is the reason for not
    // just saying `store.nodeNames = []`.
    store.nodeNames = nodeNames;
    store.markNames = markNames;
    store.plainNames = plainNames;

    for (const extension of this.#extensions) {
      extractLifecycleMethods({ extension, nodeNames, markNames, plainNames, handlers, store });
    }
  }

  /**
   * Set the string handler to use for a given name.
   *
   * This allows users to set the string handler
   */
  private setStringHandler(name: keyof Remirror.StringHandlers, handler: StringHandler): void {
    this.#stringHandlers[name] = handler;
  }

  /**
   * Set the manager value for the provided key. This is used by extensions to
   * add data to the manager.
   */
  private setStoreKey<Key extends ManagerStoreKeys>(key: Key, value: AnyManagerStore[Key]): void {
    this.#store[key] = value;
  }

  /**
   * Get the manager value for the provided key. This is used by extensions to
   * get data from the manager.
   */
  private getStoreKey<Key extends ManagerStoreKeys>(key: Key): AnyManagerStore[Key] {
    const value = this.#store[key];

    invariant(!isNullOrUndefined(value), {
      code: ErrorConstant.MANAGER_PHASE_ERROR,
      message: '`getStoreKey` should not be called before the values are available.',
    });

    return value;
  }

  /**
   * A method to set values in the extension store which is made available to
   * extension.
   *
   * **NOTE** This method should only be used in the `onCreate` extension method
   * or it will throw an error.
   */
  private setExtensionStore<Key extends keyof Remirror.ExtensionStore>(
    key: Key,
    value: Remirror.ExtensionStore[Key],
  ) {
    invariant(this.#phase <= ManagerPhase.EditorView, {
      code: ErrorConstant.MANAGER_PHASE_ERROR,
      message:
        '`setExtensionStore` should only be called during the `onCreate` lifecycle hook. Make sure to only call it within the returned methods.',
    });

    this.#extensionStore[key] = value;
  }

  /**
   * Create the initial store.
   */
  private createExtensionStore(): Remirror.ExtensionStore {
    const store: Remirror.ExtensionStore = object();
    const enumerable = true;

    // Allow current state to default to `getState` for first access.
    // This fixed an issue with #814
    let currentState: EditorState | undefined;
    let previousState: EditorState | undefined;

    Object.defineProperties(store, {
      extensions: { get: () => this.#extensions, enumerable },
      phase: { get: () => this.#phase, enumerable },
      view: { get: () => this.view, enumerable },
      managerSettings: { get: () => freeze(this.#settings), enumerable },
      getState: { value: this.getState, enumerable },
      updateState: { value: this.updateState, enumerable },
      isMounted: { value: () => this.mounted, enumerable },
      getExtension: { value: this.getExtension.bind(this), enumerable },
      manager: { get: () => this, enumerable },
      document: { get: () => this.document, enumerable },
      stringHandlers: { get: () => this.#stringHandlers, enumerable },
      currentState: {
        get: () => (currentState ??= this.getState()),
        set: (state: EditorState) => {
          currentState = state;
        },
        enumerable,
      },
      previousState: {
        get: () => previousState,
        set: (state: EditorState) => {
          previousState = state;
        },
        enumerable,
      },
    });

    store.getStoreKey = this.getStoreKey.bind(this);
    store.setStoreKey = this.setStoreKey.bind(this);
    store.setExtensionStore = this.setExtensionStore.bind(this);
    store.setStringHandler = this.setStringHandler.bind(this);

    return store;
  }

  /**
   * A state getter method which is passed into the params.
   */
  private readonly getState = (): EditorState => {
    if (this.#phase >= ManagerPhase.EditorView) {
      return this.view.state;
    }

    invariant(this.#framework, {
      code: ErrorConstant.MANAGER_PHASE_ERROR,
      message:
        '`getState` can only be called after the `Framework` or the `EditorView` has been added to the manager`. Check your plugins to make sure that the decorations callback uses the state argument.',
    });

    return this.#framework?.initialEditorState;
  };

  /**
   * Stores the editor view on the manager
   *
   * @param view - the editor view
   */
  addView(view: EditorView<this['~Sch']>): this {
    if (this.#phase >= ManagerPhase.EditorView) {
      // Do nothing since a view has already been added.
      return this;
    }

    this.#firstStateUpdate = true;

    // Update the lifecycle phase.
    this.#phase = ManagerPhase.EditorView;

    // Store the view.
    this.#store.view = view;

    for (const handler of this.#handlers.view) {
      const disposer = handler(view);

      if (disposer) {
        this.#disposers.push(disposer);
      }
    }

    return this;
  }

  /**
   * Attach a framework to the manager.
   */
  attachFramework(
    framework: BaseFramework<Extension>,
    updateHandler: (props: StateUpdateLifecycleProps) => void,
  ): void {
    if (this.#framework === framework) {
      // Do nothing if the instances are identical.
      return;
    }

    if (this.#framework) {
      // Destroy the old instance.
      this.#framework.destroy();

      // Remove the event listener. This should exist.
      this.#disposeFramework?.();
    }

    // Replace with the new instance.
    this.#framework = framework;
    this.#disposeFramework = this.addHandler('stateUpdate', updateHandler);
  }

  /* Public Methods */

  /**
   * Create an empty document for the editor based on the current schema.
   *
   * This automatically looks at the supported content for the doc and the
   * available nodes which fulfil that content in order to create a document
   * with only the minimal required content.
   *
   * This can be used in conjunction with the create state to reset the current
   * value of the editor.
   */
  createEmptyDoc(): ProsemirrorNode<GetSchema<Extension>> {
    const doc = this.schema.nodes.doc?.createAndFill();

    // Make sure the `doc` was created.
    invariant(doc, {
      code: ErrorConstant.INVALID_CONTENT,
      message: `An empty node could not be created due to an invalid schema.`,
    });

    return doc;
  }

  /**
   * Create the editor state from content passed to this extension manager.
   */
  createState(props: CreateEditorStateProps = {}): EditorState<GetSchema<Extension>> {
    const { onError, defaultSelection = 'end' } = this.settings;
    const {
      content = this.createEmptyDoc(),
      selection = defaultSelection,
      stringHandler = this.settings.stringHandler,
    } = props;
    const { schema, plugins } = this.store;

    const doc = createDocumentNode({
      stringHandler: isString(stringHandler) ? this.stringHandlers[stringHandler] : stringHandler,
      document: this.document,
      content,
      onError,
      schema,
      selection,
    });

    return EditorState.create({
      schema,
      doc,
      plugins,
      selection: getTextSelection(selection, doc),
    });
  }

  /**
   * Add a handler to the manager.
   *
   * Currently the only event that can be listened to is the `destroy` event.
   */
  addHandler<Key extends keyof ManagerEvents>(event: Key, cb: ManagerEvents[Key]): Unsubscribe {
    return this.#events.on(event, cb);
  }

  /**
   * Update the state of the view and trigger the `onStateUpdate` lifecycle
   * method as well.
   */
  private readonly updateState = (state: EditorState<this['~Sch']>) => {
    const previousState = this.getState();

    this.view.updateState(state);
    this.onStateUpdate({ previousState, state });
  };

  /**
   * This method should be called by the view layer every time the state is
   * updated.
   *
   * An example usage of this is within the collaboration extension.
   */
  onStateUpdate(props: Omit<StateUpdateLifecycleProps, 'firstUpdate'>): void {
    const firstUpdate = this.#firstStateUpdate;

    this.#extensionStore.currentState = props.state;
    this.#extensionStore.previousState = props.previousState;

    if (this.#firstStateUpdate) {
      this.#phase = ManagerPhase.Runtime;
      this.#firstStateUpdate = false;
    }

    const propsWithUpdate = { ...props, firstUpdate };

    for (const handler of this.#handlers.update) {
      handler(propsWithUpdate);
    }

    this.#events.emit('stateUpdate', propsWithUpdate);
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
   * Make a clone of the manager.
   *
   * @internalremarks What about the state stored in the extensions and presets,
   * does this need to be recreated as well?
   */
  clone(): RemirrorManager<Extension> {
    const extensions = this.#extensions.map((e) => e.clone(e.options));
    const manager = RemirrorManager.create(() => extensions, this.#settings);
    this.#events.emit('clone', manager);

    return manager;
  }

  /**
   * Recreate the manager with new settings and extensions
   */
  recreate<ExtraExtension extends AnyExtension>(
    extensions: ExtraExtension[] = [],
    settings: Remirror.ManagerSettings = {},
  ): RemirrorManager<Extension | ExtraExtension> {
    const currentExtensions = this.#extensions.map((e) => e.clone(e.initialOptions));
    const manager = RemirrorManager.create(() => [...currentExtensions, ...extensions], settings);
    this.#events.emit('recreate', manager);

    return manager;
  }

  /**
   * This method should be called to destroy the manager and remove the view.
   */
  destroy(): void {
    this.#phase = ManagerPhase.Destroy;

    for (const plugin of this.view?.state.plugins ?? []) {
      plugin.getState(this.view.state)?.destroy?.();
    }

    // Make sure to destroy the framework and it's state update listener if it
    // exists.
    this.#framework?.destroy();
    this.#disposeFramework?.();

    // Run all cleanup methods returned by the `onView` and `onCreate` methods.
    for (const dispose of this.#disposers) {
      dispose();
    }

    // TODO: prevent `dispatchTransaction` from being called again
    for (const onDestroy of this.#handlers.destroy) {
      onDestroy();
    }

    this.view?.destroy();

    this.#events.emit('destroy');
  }

  /**
   * Check whether the manager includes the names or constructors provided for
   * the preset and extensions.
   *
   * Returns true if all are included, returns false otherwise.
   */
  includes(mustIncludeList: Array<AnyExtensionConstructor | string>): boolean {
    // Searches can be made by either the name of the extension / preset or the
    // names of the constructor. We gather the values to check in separate
    // arrays
    const names: string[] = [];
    const extensionsAndPresets: AnyExtensionConstructor[] = [];

    for (const item of this.#extensions) {
      names.push(item.name, item.constructorName);
      extensionsAndPresets.push(item.constructor);
    }

    return mustIncludeList.every((item) =>
      isString(item) ? includes(names, item) : includes(extensionsAndPresets, item),
    );
  }
}

/**
 * A function that returns the extension to be used in the RemirrorManager. This
 * is similar to a preset function except that it takes no arguments.
 *
 * ```ts
 * import { RemirrorManager } from 'remirror';
 * import { BoldExtension, ItalicExtension } from 'remirror/extensions';
 *
 * const template = () => [new BoldExtension(), new ItalicExtension()]
 * const manager = RemirrorManager.create(template);
 * ```
 *
 * If the template is mixed in with other manager creators it will add the
 * relevant extension provided.
 */
export type ExtensionTemplate<Extension extends AnyExtension> = () => Extension[];

export interface ManagerEvents {
  /**
   * Called when the state is updated.
   */
  stateUpdate: (props: StateUpdateLifecycleProps) => void;

  /**
   * Called whenever the manager is cloned with the newly created manager
   * instance.
   *
   * This is mainly used for testing so that the RemirrorTester can always
   * reference the latest manager.
   */
  clone: (manager: AnyRemirrorManager) => void;

  /**
   * Called whenever the manager is recreated with the newly created manager
   * instance.
   *
   * This is mainly used for testing so that the RemirrorTester can always
   * reference the latest manager.
   */
  recreate: (manager: AnyRemirrorManager) => void;

  /**
   * An event listener which is called whenever the manager is destroyed.
   */
  destroy: () => void;
}

export type AnyRemirrorManager = Simplify<
  Replace<
    RemirrorManager<AnyExtension>,
    {
      clone: () => AnyRemirrorManager;
      store: Replace<Remirror.ManagerStore<AnyExtension>, { chain: any }>;
      output:
        | Replace<FrameworkOutput<AnyExtension>, { chain: any; manager: AnyRemirrorManager }>
        | undefined;
      // output: any;
      // store: any;
      // attachFramework: any;
      view: EditorView;
      addView: (view: EditorView) => void;
      attachFramework: (
        framework: any,
        updateHandler: (props: StateUpdateLifecycleProps) => void,
      ) => void;
      /** @internal */
      ['~E']: AnyExtension;
      /** @internal */
      ['~Sch']: EditorSchema;
      /** @internal */
      ['~AN']: string;
      /** @internal */
      ['~N']: string;
      /** @internal */
      ['~M']: string;
      /** @internal */
      ['~P']: string;
    }
  >
>;

/**
 * Checks to see whether the provided value is a `RemirrorManager` instance.
 *
 * An optional parameter `mustIncludeList` is available if you want to check
 * that the manager includes all the listed extensions.
 *
 * @param value - the value to check
 * @param mustIncludeList - an array of presets and extension the manager must
 * include to pass the test. The identifier can either be the Extension / Preset
 * name e.g. `bold`, or the Extension / Preset constructor `BoldExtension`
 */
export function isRemirrorManager<Extension extends AnyExtension = AnyExtension>(
  value: unknown,
  mustIncludeList?: Array<AnyExtensionConstructor | string>,
): value is RemirrorManager<Extension> {
  if (!isRemirrorType(value) || !isIdentifierOfType(value, RemirrorIdentifier.Manager)) {
    return false;
  }

  // We can return true since there are no other checks to make.
  if (!mustIncludeList) {
    return true;
  }

  return (value as AnyRemirrorManager).includes(mustIncludeList);
}

export interface CreateEditorStateProps extends Omit<StringHandlerProps, 'stringHandler'> {
  /**
   * This is where content can be supplied to the Editor.
   *
   * @remarks
   *
   * Content can either be
   * - a string (which will be parsed by the stringHandler)
   * - JSON object matching Prosemirror expected shape
   * - A top level ProsemirrorNode
   *
   * If this is left undefined then the editor will use the default empty `doc`.
   */
  content?: RemirrorContentType;

  /**
   * The selection that the user should have in the created node.
   *
   * @default 'end'
   */
  selection?: PrimitiveSelection;

  /**
   * A function which transforms a string into a prosemirror node.
   *
   * @remarks
   *
   * Can be used to transform markdown / html or any other string format into a
   * prosemirror node.
   *
   * See [[`fromHTML`]] for an example of how this could work.
   */
  stringHandler?: keyof Remirror.StringHandlers | StringHandler;
}

interface RemirrorManagerConstructor extends Function {
  create<Extension extends AnyExtension>(
    extension: Extension[],
    settings?: Remirror.ManagerSettings,
  ): RemirrorManager<Extension | BuiltinPreset>;
}

export interface RemirrorManager<Extension extends AnyExtension> {
  /**
   * The constructor for the [[`RemirrorManager`]].
   */
  constructor: RemirrorManagerConstructor;

  /**
   * Pseudo type property which contains the recursively extracted `Extension`
   * stored by this manager.
   *
   * @internal
   */
  ['~E']: Extension;

  /**
   * Pseudo property which is a small hack to store the type of the schema
   * available from this manager.
   *
   * @internal
   */
  ['~Sch']: GetSchema<Extension>;

  /**
   * `AllNames`
   *
   * Get all the names of the extensions within this editor.
   *
   * @internal
   */
  ['~AN']: GetNameUnion<Extension> extends never ? string : GetNameUnion<Extension>;

  /**
   * `NodeNames`
   *
   * Type inference hack for node extension names. This is the only way I know
   * to store types on a class.
   *
   * @internal
   */
  ['~N']: GetNodeNameUnion<Extension> extends never ? string : GetNodeNameUnion<Extension>;

  /**
   * `MarkNames`
   *
   * Type inference hack for mark extension names. This is the only way I know
   * to store types on a class.
   *
   * @internal
   */
  ['~M']: GetMarkNameUnion<Extension> extends never ? string : GetMarkNameUnion<Extension>;

  /**
   * `PlainNames`
   *
   * Type inference hack for all the plain extension names. This is the only way
   * I know to store types on a class.
   *
   * @internal
   */
  ['~P']: GetPlainNameUnion<Extension> extends never ? string : GetPlainNameUnion<Extension>;
}

declare global {
  namespace Remirror {
    /**
     * Settings which can be passed into the manager.
     */
    interface ManagerSettings extends Partial<CustomDocumentProps> {
      /**
       * Set the extension priority for extension's by their name.
       */
      priority?: Record<string, ExtensionPriority>;

      /**
       * An object which excludes certain functionality from all extensions
       * within the manager.
       */
      exclude?: ExcludeOptions;

      /**
       * The error handler which is called when the JSON passed is invalid.
       *
       * @remarks
       *
       * The following can be used to setup the `onError` handler on the the
       * manager.
       *
       * ```tsx
       * import React from 'react';
       * import { Remirror, InvalidContentHandler } from 'remirror';
       * import { Remirror, useManager } from '@remirror/react';
       * import { WysiwygPreset } from 'remirror/extensions';
       *
       * const Editor = () => {
       *   const onError: InvalidContentHandler = useCallback(({ json, invalidContent, transformers }) => {
       *     // Automatically remove all invalid nodes and marks.
       *     return transformers.remove(json, invalidContent);
       *   }, []);
       *
       *   const manager = useManager(() => [new WysiwygPreset()], { onError });
       *
       *   return (
       *     <Remirror manager={manager}>
       *       <div />
       *     </Remirror>
       *   );
       * };
       * ```
       */
      onError?: InvalidContentHandler;

      /**
       * A function which transforms a string into a prosemirror node.
       *
       * @remarks
       *
       * Can be used to transform markdown / html or any other string format into a
       * prosemirror node.
       *
       * See [[`fromHTML`]] for an example of how this could work.
       */
      stringHandler?: keyof Remirror.StringHandlers | StringHandler;

      /**
       * By default remirror will work out whether this is a dom environment or
       * server environment for SSR rendering. You can override this behaviour here
       * when required.
       *
       * @default undefined
       */
      forceEnvironment?: RenderEnvironment;

      /**
       * The default named selection. This is used when `manager.createState` is
       * called without providing a selection.
       *
       * @default 'end'
       */
      defaultSelection?: 'start' | 'end' | 'all';
    }

    /**
     * Describes the object where the extension manager stores it's data.
     *
     * @remarks
     *
     * Since this is a global namespace, you can extend the store if your
     * extension is modifying the shape of the `Manager.store` property.
     */
    interface ManagerStore<Extension extends AnyExtension> {
      /**
       * The editor view stored by this instance.
       */
      view: EditorView<GetSchema<Extension>>;
    }

    interface ExtensionStore {
      /**
       * Make the remirror manager available to the editor.
       */
      manager: AnyRemirrorManager;

      /**
       * The list of all extensions included in the editor.
       */
      readonly extensions: AnyExtension[];

      /**
       * The stage the manager is currently at.
       */
      readonly phase: ManagerPhase;

      /**
       * The view available to extensions once `addView` has been called on the
       * `RemirrorManager` instance.
       */
      readonly view: EditorView;

      /**
       * The latest state.
       */
      currentState: EditorState<EditorSchema>;

      /**
       * The previous state. Will be undefined when the view is first created.
       */
      previousState?: EditorState<EditorSchema>;

      /**
       * The root document to be used for the editor. This is mainly used for
       * SSR.
       */
      readonly document: Document;

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
       * The named string handlers which are supported by the current editor
       * implementation.
       */
      readonly stringHandlers: NamedStringHandlers;

      /**
       * Return true when the editor view has been created.
       */
      readonly isMounted: () => boolean;

      /**
       * A helper method for retrieving the state of the editor
       */
      readonly getState: () => EditorState<EditorSchema>;

      /**
       * Allow extensions to trigger an update in the prosemirror state. This
       * should not be used often. It's here in case you need it in an
       * emergency.
       *
       * Internally it's used by the [[`PluginsExtension`]] to create a new
       * state when the plugins are updated at runtime.
       */
      readonly updateState: (state: EditorState<EditorSchema>) => void;

      /**
       * Get the extension instance matching the provided constructor from the
       * manager.
       *
       * This will throw an error if not defined.
       */
      readonly getExtension: <ExtensionConstructor extends AnyExtensionConstructor>(
        Constructor: ExtensionConstructor,
      ) => InstanceType<ExtensionConstructor>;

      /**
       * Get the value of a key from the manager store.
       */
      getStoreKey: <Key extends ManagerStoreKeys>(key: Key) => AnyManagerStore[Key];

      /**
       * Update the store with a specific key.
       */
      setStoreKey: <Key extends ManagerStoreKeys>(key: Key, value: AnyManagerStore[Key]) => void;

      /**
       * Set a value on the extension store. One of the design decisions in this `1.0.0`
       * version of `remirror` was to move away from passing elaborate arguments to each extension
       * method and allow extensions to interact with a store shared by all
       * extensions.
       *
       * The extension store object is immutable and will throw an error if updated directly.
       *
       * ```ts
       * class MyExtension extends PlainExtension {
       *   get name() {}
       * }
       * ```
       */
      setExtensionStore: <Key extends keyof ExtensionStore>(
        key: Key,
        value: ExtensionStore[Key],
      ) => void;

      /**
       * Set the string handler to use for a given name.
       *
       * This allows users to set the string handler
       */
      setStringHandler: (name: keyof StringHandlers, handler: StringHandler) => void;
    }
  }
}
