import type { Interpolation } from '@emotion/core';
import { InputRule, inputRules } from 'prosemirror-inputrules';
import { keymap } from 'prosemirror-keymap';
import { Schema } from 'prosemirror-model';
import { EditorState } from 'prosemirror-state';
import { suggest, Suggester } from 'prosemirror-suggest';
import { ComponentType } from 'react';

import { REMIRROR_IDENTIFIER_KEY, RemirrorIdentifier } from '@remirror/core-constants';
import {
  bool,
  hasOwnProperty,
  isArray,
  isEqual,
  isFunction,
  isIdentifierOfType,
  isRemirrorType,
  object,
} from '@remirror/core-helpers';
import {
  AttributesWithClass,
  EditorSchema,
  EditorStateParameter,
  EditorView,
  KeyBindingCommandFunction,
  KeyBindings,
  MarkExtensionSpec,
  NodeExtensionSpec,
  NodeViewMethod,
  PlainObject,
  PluginKey,
  ProsemirrorAttributes,
  ProsemirrorCommandFunction,
  ProsemirrorPlugin,
  TransactionParameter,
} from '@remirror/core-types';
import {
  chainKeyBindingCommands,
  createDocumentNode,
  CreateDocumentNodeParams,
  getPluginState,
} from '@remirror/core-utils';

import {
  ActionsFromExtensions as CommandsFromExtensions,
  AnyExtension,
  GetCommands,
  GetConstructor,
  GetMarkNames,
  GetNodeNames,
  isMarkExtension,
  isNodeExtension,
  SchemaFromExtension,
} from '../extension';
import { AnyPreset } from '../preset';
import {
  createCommands,
  createExtensionTags,
  createHelpers,
  defaultIsActive,
  defaultIsEnabled,
  extensionPropertyMapper,
  hasExtensionProperty,
  ignoreFunctions,
  transformExtensionOrPreset as transformExtensionOrPresetList,
} from './manager-helpers';

/* eslint-disable @typescript-eslint/explicit-member-accessibility */

/**
 * A type that matches any manager.
 */
export type AnyManager = Manager<any, any>;

/**
 * Checks to see whether the provided value is an `Manager`.
 *
 * @param value - the value to check
 */
export const isManager = (value: unknown): value is AnyManager =>
  isRemirrorType(value) && isIdentifierOfType(value, RemirrorIdentifier.Manager);

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
export class Manager<
  ExtensionUnion extends AnyExtension,
  PresetUnion extends AnyPreset<ExtensionUnion>
> {
  /**
   * A static method for creating a manager.
   */
  public static of<
    ExtensionUnion extends AnyExtension,
    PresetUnion extends AnyPreset<ExtensionUnion>
  >(...extensionOrPresetList: Array<ExtensionUnion | PresetUnion>) {
    return new Manager<ExtensionUnion, PresetUnion>(...extensionOrPresetList);
  }

  /**
   * Identifies this as a `Manager`.
   *
   * @internal
   */
  static get [REMIRROR_IDENTIFIER_KEY]() {
    return RemirrorIdentifier.Manager;
  }

  #extensions: ExtensionUnion[];
  #extensionMap: Map<GetConstructor<ExtensionUnion>, ExtensionUnion>;

  /**
   * The extensions stored by this manager
   */
  get extensions(): readonly ExtensionUnion[] {
    return this.#extensions;
  }

  #presets: PresetUnion[];
  #presetMap: Map<GetConstructor<PresetUnion>, PresetUnion>;

  /**
   * The preset stored by this manager
   */
  get presets(): readonly PresetUnion[] {
    return this.#presets;
  }

  /**
   * The extension manager store.
   */
  #store: ManagerStore<ExtensionUnion> = object();

  #nodes: Record<GetNodeNames<ExtensionUnion>, NodeExtensionSpec> = object();
  #marks: Record<GetMarkNames<ExtensionUnion>, MarkExtensionSpec> = object();

  /**
   * Creates the extension manager which is used to simplify the management of
   * the prosemirror editor.
   *
   * This should not be called directly if you want to use prioritized
   * extensions. Instead use `Manager.create`.
   */
  private constructor(...extensionOrPresetList: Array<ExtensionUnion | PresetUnion>) {
    const { extensions, extensionMap, presets, presetMap } = transformExtensionOrPresetList<
      ExtensionUnion,
      PresetUnion
    >(extensionOrPresetList);

    this.#extensions = extensions;
    this.#extensionMap = extensionMap;
    this.#presets = presets;
    this.#presetMap = presetMap;

    for (const extension of this.#extensions) {
      if (isNodeExtension(extension)) {
        const { name, schema } = extension;
        this.#nodes[name as GetNodeNames<ExtensionUnion>] = schema;
      }

      if (isMarkExtension(extension)) {
        const { name, schema } = extension;

        this.#marks[name as GetMarkNames<ExtensionUnion>] = schema;
      }
    }

    // Initialize the schema immediately since this doesn't ever change.
    this.#store.schema = this.createSchema();

    // The tags in the editor are stored here.
    this.#store.tags = createExtensionTags(this.extensions);
  }

  /**
   * Initialize the extension manager with important data.
   *
   * This is called by the view layer and provides
   */
  public initialize() {
    this.#store.extensionPlugins = this.plugins();
    this.#store.keymaps = this.keymaps();
    this.#store.inputRules = this.inputRules();
    this.#store.pasteRules = this.pasteRules();
    this.#store.suggestions = this.suggestions();

    this.#store.plugins = [
      ...this.#store.extensionPlugins,
      this.#store.suggestions,
      this.#store.inputRules,
      ...this.#store.pasteRules,
      ...this.#store.keymaps,
    ];

    this.#store.helpers = this.helpers();

    return this;
  }

  /**
   * Stores the editor view on the manager
   *
   * @param view - the editor view
   */
  public initView(view: EditorView<SchemaFromExtension<ExtensionUnion>>) {
    this.#store.view = view;
    this.#store.actions = this.createCommands({
      ...this.params,
      view,
      isEditable: () =>
        isFunction(view.props.editable) ? view.props.editable(this.getState()) : false,
    });
  }

  /* Public Get Properties */

  /**
   * Should be used to check whether the manager needs to be reinitialized.
   */
  get initialized() {
    return this.#initialized;
  }

  /**
   * All the dynamically generated attributes provided by each extension.
   *
   * @remarks
   *
   * High priority extensions have preference over the lower priority
   * extensions.
   */
  get attributes() {
    let combinedAttributes: AttributesWithClass = object();
    this.extensions
      .filter(hasExtensionProperty('attributes'))
      .filter((extension) => !extension.options.exclude.attributes)
      .map((extension) => extension.attributes(this.params))
      .reverse()
      .forEach((attributes) => {
        combinedAttributes = {
          ...combinedAttributes,
          ...attributes,
          class:
            (combinedAttributes.class ?? '') + (bool(attributes.class) ? attributes.class : '') ||
            '',
        };
      });

    return combinedAttributes;
  }

  /**
   * Retrieve all the SSRComponent's from the extensions. This is used to render
   * the initial SSR output.
   */
  get components() {
    const components: Record<string, ComponentType> = object();

    for (const extension of this.extensions) {
      if (!extension.#config.SSRComponent || extension.options.exclude.ssr) {
        continue;
      }

      components[extension.name] = extension.options.SSRComponent;
    }

    return components;
  }

  /**
   * Get the extension manager store which is accessible at initialization.
   */
  get store() {
    return this.#store;
  }

  /**
   * Returns the stored nodes
   */
  get nodes() {
    return this.#nodes;
  }

  /**
   * Returns the store marks.
   */
  get marks() {
    return this.#marks;
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
    return this.#store.view;
  }

  /* Private Get Properties */

  /**
   * Utility getter for accessing the parameters which are passed to the
   * extension methods
   */
  private get params(): ManagerParameter<SchemaFromExtension<ExtensionUnion>> {
    return {
      tags: this.tags,
      schema: this.schema,
      getState: this.getState,
      commands: this.commands,
      getHelpers: this.getHelpers,
    };
  }

  /**
   * A state getter method which is passed into the params.
   */
  private getState() {
    return this.view.state;
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
  }: Omit<CreateDocumentNodeParams, 'schema'>) {
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
   * Collect data from all the extensions. This will be made available to the
   * consuming react component within the context data and also the child
   * renderProp function parameters.
   */
  public extensionData() {
    const data: Record<string, PlainObject> = object();

    for (const extension of this.extensions) {
      data[extension.name] = extension.extensionData
        ? extensionPropertyMapper('extensionData', this.params)(extension)
        : {};
    }

    return data;
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
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    if (!isManager(otherManager)) {
      return false;
    }

    if (this.extensions.length !== otherManager.extensions.length) {
      return false;
    }

    for (let ii = 0; ii <= this.extensions.length - 1; ii++) {
      const extension = this.extensions[ii];
      const otherExtension = otherManager.extensions[ii];

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
   * This is currently used in the collaboration plugin.
   */
  public onTransaction(parameters: OnTransactionManagerParams) {
    this.extensions.filter(hasExtensionProperty('onTransaction')).forEach(({ onTransaction }) => {
      onTransaction({ ...parameters, ...this.params, view: this.store.view });
    });
  }

  /**
   * Retrieve the state for a given extension name. This will throw an error if
   * the extension doesn't exist.
   *
   * @param name - the name of the extension
   */
  public getPluginState<GState>(name: this['_N']): GState {
    this.checkInitialized();
    const key = this.pluginKeys[name];
    if (!key) {
      throw new Error(`Cannot retrieve state for an extension: ${name} which doesn't exist`);
    }
    return getPluginState<GState>(key, this.getState());
  }

  /**
   * Adjusts the rendered element based on the extension transformers.
   */
  public ssrTransformer(element: JSX.Element): JSX.Element {
    return this.extensions
      .filter(hasExtensionProperty('ssrTransformer'))
      .filter((extension) => !extension.options.exclude.ssr)
      .reduce((previousElement, extension) => {
        return extension.ssrTransformer(previousElement, this.params);
      }, element);
  }

  /* Private Methods */

  /**
   * Checks to see if the extension manager has been initialized and throws if
   * not
   */
  private checkInitialized() {
    if (!this.#initialized) {
      throw new Error(
        'Before using the extension manager it must be initialized with a portalContainer and getState',
      );
    }
  }

  /**
   * Dynamically create the editor schema based on the extensions that have been
   * passed in.
   *
   * This is called as soon as the Manager is created.
   */
  private createSchema(): EditorSchema<GetNodeNames<ExtensionUnion>, GetMarkNames<ExtensionUnion>> {
    return new Schema({ nodes: this.nodes, marks: this.marks });
  }

  /**
   * Retrieve all the extension plugin keys
   */
  private get pluginKeys() {
    const pluginKeys: Record<this['_N'], PluginKey> = object();
    this.extensions
      .filter((extension) => extension.plugin)
      .forEach(({ pluginKey, name }) => {
        pluginKeys[name as this['_N']] = pluginKey;
      });

    return pluginKeys;
  }

  /**
   * Create the actions which are passed into the render props.
   *
   * RemirrorActions allow for checking if a node / mark is active, enabled, and
   * also running the command.
   *
   * - `isActive` defaults to a function returning false
   * - `isEnabled` defaults to a function returning true
   */
  private createCommands(parameters: CommandParameter): this['_C'] {
    // Will throw if not initialized
    this.checkInitialized();

    const extensions = this.extensions;
    const actions: AnyCommands = object();

    // Creates the methods that take in attrs and dispatch an action into the
    // editor
    const commands = createCommands({ extensions, params: parameters });

    Object.entries(commands).forEach(([commandName, { command, isEnabled, name }]) => {
      const isActive = this.#store.isActive[name as this['_Names']] ?? defaultIsActive;

      actions[commandName] = command as CommandMethod;
      actions[commandName].isActive = (attributes: ProsemirrorAttributes) =>
        isActive({ attrs: attributes });
      actions[commandName].isEnabled = isEnabled ?? defaultIsEnabled;
    });

    return actions as this['_C'];
  }

  private createHelpers(): this['_H'] {
    const helpers = object<PlainObject>();
    const methods = createHelpers({ extensions: this.extensions, params: this.params });

    Object.entries(methods).forEach(([helperName, helper]) => {
      helpers[helperName] = helper;
    });

    return helpers as this['_H'];
  }

  /**
   * Retrieve an object mapping extension names to their isActive() methods
   */
  private isActiveMethods() {
    // Will throw if not initialized
    this.checkInitialized();

    const isActiveMethods: Record<this['_Names'], ExtensionIsActiveFunction> = object();

    return this.extensions.filter(hasExtensionProperty('isActive')).reduce(
      (accumulator, extension) => ({
        ...accumulator,
        [extension.name]: extensionPropertyMapper('isActive', this.params)(extension),
      }),
      isActiveMethods,
    );
  }

  /**
   * Retrieve all plugins from the passed in extensions
   */
  private plugins() {
    this.checkInitialized();
    const plugins: ProsemirrorPlugin[] = [];
    const extensionPlugins = this.extensions
      .filter(hasExtensionProperty('plugin'))
      .filter((extension) => !extension.options.exclude.plugin)
      .map(extensionPropertyMapper('plugin', this.params)) as ProsemirrorPlugin[];

    extensionPlugins.forEach((plugin) => {
      plugins.push(plugin);
    });

    return plugins;
  }

  /**
   * Retrieve the nodeViews created on the extensions for use within prosemirror
   * state
   */
  private nodeViews() {
    this.checkInitialized();
    const nodeViews: Record<string, NodeViewMethod> = object();
    return this.extensions
      .filter(hasExtensionProperty('nodeView'))
      .filter((extension) => !extension.options.exclude.nodeView)
      .reduce(
        (previousNodeViews, extension) => ({
          ...previousNodeViews,
          [extension.name]: extensionPropertyMapper(
            'nodeView',
            this.params,
          )(extension) as NodeViewMethod,
        }),
        nodeViews,
      );
  }

  /**
   * Retrieve all keymaps (how the editor responds to keyboard commands).
   */
  private keymaps() {
    this.checkInitialized();
    const extensionKeymaps: KeyBindings[] = this.extensions
      .filter(hasExtensionProperty('keys'))
      .filter((extension) => !extension.options.exclude.keys)
      .map(extensionPropertyMapper('keys', this.params));

    const previousCommandsMap = new Map<string, KeyBindingCommandFunction[]>();
    const mappedCommands: Record<string, ProsemirrorCommandFunction> = object();

    for (const extensionKeymap of extensionKeymaps) {
      for (const key in extensionKeymap) {
        if (!hasOwnProperty(extensionKeymap, key)) {
          continue;
        }

        const previousCommands: KeyBindingCommandFunction[] = previousCommandsMap.get(key) ?? [];
        const commands = [...previousCommands, extensionKeymap[key]];
        const command = chainKeyBindingCommands(...commands);
        previousCommandsMap.set(key, commands);

        mappedCommands[key] = (state, dispatch, view) => {
          return command({ state, dispatch, view, next: () => false });
        };
      }
    }

    return [keymap(mappedCommands)];
  }

  /**
   * Retrieve all inputRules (how the editor responds to text matching certain
   * rules).
   */
  private inputRules() {
    this.checkInitialized();
    const rules: InputRule[] = [];
    const extensionInputRules = this.extensions
      .filter(hasExtensionProperty('inputRules'))
      .filter((extension) => !extension.options.exclude.inputRules)
      .map(extensionPropertyMapper('inputRules', this.params)) as InputRule[][];

    extensionInputRules.forEach((rule) => {
      rules.push(...rule);
    });

    return inputRules({ rules });
  }

  /**
   * Retrieve all pasteRules (rules for how the editor responds to pastedText).
   */
  private pasteRules(): ProsemirrorPlugin[] {
    this.checkInitialized();
    const pasteRules: ProsemirrorPlugin[] = [];
    const extensionPasteRules = this.extensions
      .filter(hasExtensionProperty('pasteRules'))
      .filter((extension) => !extension.options.exclude.pasteRules)
      .map(extensionPropertyMapper('pasteRules', this.params)) as ProsemirrorPlugin[][];

    extensionPasteRules.forEach((rules) => {
      pasteRules.push(...rules);
    });

    return pasteRules;
  }

  /**
   * Extensions can register custom styles for the editor. This retrieves them.
   */
  private styles(): Interpolation[] {
    this.checkInitialized();
    const extensionStyles = this.extensions
      .filter(hasExtensionProperty('styles'))
      .filter((extension) => !extension.options.exclude.styles)
      .map(extensionPropertyMapper('styles', this.params));

    return extensionStyles;
  }

  private suggestions() {
    this.checkInitialized();
    const suggestions: Suggester[] = [];

    const extensionSuggesters = this.extensions
      .filter(hasExtensionProperty('suggestions'))
      .filter((extension) => !extension.options.exclude.suggestions)
      .map(extensionPropertyMapper('suggestions', this.params));

    extensionSuggesters.forEach((suggester) => {
      suggestions.push(...(isArray(suggester) ? suggester : [suggester]));
    });

    return suggest(...suggestions);
  }

  /**
   * Called when removing the manager and all preset and extensions.
   */
  public destroy() {
    // Only destroy if this has already been initialized.
    if (!this.initialized) {
      return;
    }
  }

  /**
   * `Commands`
   *
   * Type inference hack for all the actions this manager provides. This is the
   * only way I know to store types on a class.
   *
   * @internal
   * INTERNAL USE ONLY
   */
  public readonly _C!: CommandsFromExtensions<ExtensionUnion>;
}

export interface ManagerParams<
  ExtensionUnion extends AnyExtension = any,
  PresetUnion extends AnyPreset<ExtensionUnion> = any
> {
  /**
   * The extension manager
   */
  manager: Manager<ExtensionUnion, PresetUnion>;
}

/**
 * Describes the object where the extension manager stores it's data.
 */
export interface ManagerStore<ExtensionUnion extends AnyExtension = any>
  extends GlobalManagerStore<ExtensionUnion> {}

export interface OnTransactionManagerParams extends TransactionParameter, EditorStateParameter {}

declare global {
  /**
   * Use this to extend the store if you're extension is modifying the shape of
   * the `Manager.store` property.
   */
  interface GlobalManagerStore<ExtensionUnion extends AnyExtension = any> {
    /**
     * The schema created by this extension manager.
     */
    schema: SchemaFromExtension<ExtensionUnion>;

    /**
     * All the plugins defined by the extensions.
     */
    extensionPlugins: ProsemirrorPlugin[];

    /** All of the plugins combined together from all sources */
    plugins: ProsemirrorPlugin[];

    /**
     * The keymap arrangement.
     */
    keymaps: ProsemirrorPlugin[];

    /**
     * The input rules for the editor.
     */
    inputRules: ProsemirrorPlugin;
    pasteRules: ProsemirrorPlugin[];
    suggestions: ProsemirrorPlugin;

    /**
     * The commands defined within this extension.
     */
    commands: GetCommands<ExtensionUnion>;
    view: EditorView<SchemaFromExtension<ExtensionUnion>>;
    tags: ExtensionTags<ExtensionUnion>;
  }

  /**
   * The initialization params which are passed by the view layer into the
   * extension manager. This can be added to by the requesting framework layer.
   */
  interface ManagerInitializationParams<ExtensionUnion extends AnyExtension = any> {}
}

/* eslint-enable @typescript-eslint/explicit-member-accessibility */
