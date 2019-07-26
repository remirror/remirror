import { Interpolation } from 'emotion';
import { InputRule, inputRules } from 'prosemirror-inputrules';
import { keymap } from 'prosemirror-keymap';
import { Schema } from 'prosemirror-model';
import { EditorState, PluginKey } from 'prosemirror-state';
import { ComponentType } from 'react';
import { AnyExtension, ExtensionCommands, FlexibleExtension } from './extension';
import {
  createCommands,
  createExtensionTags,
  defaultIsActive,
  defaultIsEnabled,
  extensionPropertyMapper,
  hasExtensionProperty,
  ignoreFunctions,
  transformExtensionMap,
} from './extension-manager.helpers';
import { bool, isEqual, isFunction, isInstanceOf } from './helpers';
import { createDocumentNode, CreateDocumentNodeParams, getPluginState } from './helpers/document';
import { isMarkExtension } from './mark-extension';
import { isNodeExtension } from './node-extension';
import { NodeViewPortalContainer } from './portal-container';
import {
  ActionGetter,
  ActionMethods,
  Attrs,
  AttrsWithClass,
  BooleanExtensionCheck,
  CommandFunction,
  CommandParams,
  EditorSchema,
  EditorStateParams,
  EditorView,
  ExtensionManagerInitParams,
  ExtensionManagerParams,
  ExtensionTags,
  MarkExtensionSpec,
  NodeExtensionSpec,
  NodeViewMethod,
  PlainObject,
  ProsemirrorPlugin,
  RemirrorActions,
  TransactionParams,
} from './types';

export interface ExtensionManagerData {
  schema: EditorSchema;
  styles: Interpolation;
  directPlugins: ProsemirrorPlugin[];
  plugins: ProsemirrorPlugin[];
  nodeViews: Record<string, NodeViewMethod>;
  keymaps: ProsemirrorPlugin[];
  inputRules: ProsemirrorPlugin;
  pasteRules: ProsemirrorPlugin[];
  actions: RemirrorActions;
  view: EditorView;
  isActive: Record<string, BooleanExtensionCheck<string>>;
  isEnabled: Record<string, BooleanExtensionCheck<string>>;
  options: Record<string, PlainObject>;
  tags: ExtensionTags;
}

/**
 * A class to manage the extensions and prosemirror interactions of our editor.
 *
 * @remarks
 *
 * The extension manager has three phases of initialization:
 *
 * - Construction - This takes in all the extensions and creates the schema.
 *
 * ```ts
 * const manager = new ExtensionManager([ new DocExtension(), new TextExtension(), new ParagraphExtension()])
 * ```
 *
 * - Initialize Getters - This connects the extension manager to the lazily
 *   evaluated `getState` method and the `portalContainer`. Once these are
 *   created and allows access to its data.
 *
 * ```ts
 * manager.init({ getState: () => state, portalContainer: new NodeViewPortalContainer })
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
export class ExtensionManager implements ExtensionManagerInitParams {
  /**
   * A static method for creating a new extension manager.
   */
  public static create(extensions: FlexibleExtension[]) {
    return new ExtensionManager(extensions);
  }

  /**
   * Retrieve the latest state of the editor this manager is responsible for.
   * This is only available after the first initialization.
   */
  public getState!: () => EditorState;

  /**
   * Retrieve the portal container for any custom nodeViews. This is only
   * available after the first initialization.
   */
  public portalContainer!: NodeViewPortalContainer;

  /**
   * The extensions stored by this manager
   */
  public readonly extensions: AnyExtension[];

  /**
   * Whether or not the manager has been initialized. This happens after init is
   * called.
   */
  private initialized = false;

  /**
   * The extension manager data which is stored after initialization
   */
  private initData: ExtensionManagerData = {} as ExtensionManagerData;

  /**
   * Retrieve the actions for a specified extension.
   */
  private getActions: ActionGetter = <GAttrs>(name: string) =>
    this.initData.actions[name] as ActionMethods<GAttrs>;

  /**
   * Creates the extension manager which is used to simplify the management of
   * the different facets of building an editor with
   */
  constructor(extensionMapValues: FlexibleExtension[]) {
    this.extensions = transformExtensionMap(extensionMapValues);

    // Initialize the schema immediately since this doesn't ever change.
    this.initData.schema = this.createSchema();

    // Options are cached here.
    this.initData.options = this.extensionOptions();

    // Tags are stored here.
    this.initData.tags = createExtensionTags(this.extensions);
  }

  /**
   * Initialize the extension manager with important data.
   *
   * This is called by the view layer and provides
   */
  public init({ getState, portalContainer }: ExtensionManagerInitParams) {
    if (this.initialized) {
      console.warn(
        'This manager is already in use. Avoid using the same manager for more than one editor as this may cause problems.',
      );
    }

    this.getState = getState;
    this.portalContainer = portalContainer;
    this.initialized = true;

    this.initData.styles = this.styles();
    this.initData.directPlugins = this.plugins();
    this.initData.nodeViews = this.nodeViews();
    this.initData.keymaps = this.keymaps();
    this.initData.inputRules = this.inputRules();
    this.initData.pasteRules = this.pasteRules();
    this.initData.isActive = this.booleanCheck('isActive');
    this.initData.isEnabled = this.booleanCheck('isEnabled');

    this.initData.plugins = [
      ...this.initData.directPlugins,
      this.initData.inputRules,
      ...this.initData.pasteRules,
      ...this.initData.keymaps,
    ];

    return this;
  }

  /**
   * Stores the editor view on the manager
   *
   * @param view - the editor view
   */
  public initView(view: EditorView) {
    this.initData.view = view;
    this.initData.actions = this.actions({
      ...this.params,
      view,
      isEditable: () => (isFunction(view.props.editable) ? view.props.editable(this.getState()) : false),
    });
  }

  /* Public Get Properties */

  /**
   * All the dynamically generated attributes provided by each extension. High
   * priority extensions have preference over the lower priority extensions.
   */
  get attributes() {
    let combinedAttributes: AttrsWithClass = {};
    this.extensions
      .filter(hasExtensionProperty('attributes'))
      .filter(extension => !extension.options.exclude.attributes)
      .map(extension => extension.attributes(this.params))
      .reverse()
      .forEach(attrs => {
        combinedAttributes = {
          ...combinedAttributes,
          ...attrs,
          class: (combinedAttributes.class || '') + (bool(attrs.class) ? attrs.class : '') || '',
        };
      });

    return combinedAttributes;
  }

  /**
   * Retrieve all the SSRComponent properties from the extensions.
   * This is used to render the initial SSR output.
   */
  get components() {
    const components: Record<string, ComponentType> = {};
    this.extensions
      .filter(extension => extension.options.SSRComponent)
      // User can opt out of SSR rendering
      .filter(extension => !extension.options.exclude.ssr)
      .forEach(({ name, options: { SSRComponent } }) => {
        components[name] = SSRComponent;
      });

    return components;
  }

  /**
   * Get the extension manager data which is stored after initializing.
   */
  get data() {
    if (!this.initialized) {
      throw new Error('Extension Manager must be initialized before attempting to access the data');
    }

    return this.initData;
  }

  get options() {
    return this.initData.options;
  }

  /**
   * Filters through all provided extensions and picks the nodes
   */
  get nodes() {
    const nodes: Record<string, NodeExtensionSpec> = {};
    this.extensions.filter(isNodeExtension).forEach(({ name, schema }) => {
      nodes[name] = schema;
    });
    return nodes;
  }

  /**
   * Filters through all provided extensions and picks the marks
   */
  get marks() {
    const marks: Record<string, MarkExtensionSpec> = {};
    this.extensions.filter(isMarkExtension).forEach(({ name, schema }) => {
      marks[name] = schema;
    });
    return marks;
  }

  /**
   * A shorthand method for retrieving the schema for this extension manager
   * from the data.
   */
  get schema() {
    return this.initData.schema;
  }

  /**
   * A shorthand getter for retrieving the tags from the extension manager.
   */
  get tags() {
    return this.initData.tags;
  }

  /**
   * A shorthand way of retrieving view.
   */
  get view() {
    return this.initData.view;
  }

  /* Private Get Properties */

  /**
   * Utility getter for accessing the schema params
   */
  private get params(): ExtensionManagerParams {
    return {
      tags: this.tags,
      schema: this.schema,
      getState: this.getState,
      portalContainer: this.portalContainer,
      getActions: this.getActions,
    };
  }

  /* Public Methods */

  /**
   * Create the editor state from content passed to this extension manager.
   */
  public createState({ content, doc, stringHandler }: Omit<CreateDocumentNodeParams, 'schema'>) {
    const { schema, plugins } = this.data;
    return EditorState.create({
      schema,
      doc: createDocumentNode({
        content,
        doc,
        schema,
        stringHandler,
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
    const data: Record<string, PlainObject> = {};

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
   * ExtensionManagers are equal when
   * - They have the same number of extensions
   * - Same order of extensions
   * - Each extension has the same options (ignoring methods)
   *
   * @param otherManager - the value to test against
   */
  public isEqual(otherManager: unknown) {
    if (!isExtensionManager(otherManager)) {
      return false;
    }

    if (this.extensions.length !== otherManager.extensions.length) {
      return false;
    }

    for (let ii = 0; ii <= this.extensions.length - 1; ii++) {
      const ext = this.extensions[ii];
      const otherExt = otherManager.extensions[ii];

      if (
        ext.constructor === otherExt.constructor &&
        isEqual(ignoreFunctions(ext.options), ignoreFunctions(otherExt.options))
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
  public onTransaction(params: OnTransactionManagerParams) {
    this.extensions.filter(hasExtensionProperty('onTransaction')).forEach(({ onTransaction }) => {
      onTransaction({ ...params, ...this.params, view: this.data.view });
    });
  }

  /**
   * Retrieve the state for a given extension name. This will throw an error if
   * the extension doesn't exist.
   *
   * @param name - the name of the extension
   */
  public getPluginState<GState>(name: string): GState {
    this.checkInitialized();
    const key = this.pluginKeys[name];
    if (!key) {
      throw new Error(`Cannot retrieve state for an extension: ${name} which doesn\'t exist`);
    }
    return getPluginState<GState>(key, this.getState());
  }

  /**
   * Adjusts the rendered element based on the extension transformers.
   */
  public ssrTransformer(element: JSX.Element): JSX.Element {
    return this.extensions
      .filter(hasExtensionProperty('ssrTransformer'))
      .filter(extension => !extension.options.exclude.ssr)
      .reduce((prevElement, extension) => {
        return extension.ssrTransformer(prevElement, this.params);
      }, element);
  }

  /* Private Methods */

  /**
   * Checks to see if the extension manager has been initialized and throws if
   * not
   */
  private checkInitialized() {
    if (!this.initialized) {
      throw new Error(
        'Before using the extension manager it must be initialized with a portalContainer and getState',
      );
    }
  }

  /**
   * Dynamically create the editor schema based on the extensions that have been
   * passed in.
   *
   * This is called as soon as the ExtensionManager is created.
   */
  private createSchema(): EditorSchema {
    return new Schema({ nodes: this.nodes, marks: this.marks });
  }

  /**
   * Retrieve all the extension plugin keys
   */
  private get pluginKeys() {
    const pluginKeys: Record<string, PluginKey> = {};
    this.extensions
      .filter(extension => extension.plugin)
      .forEach(({ pluginKey, name }) => {
        pluginKeys[name] = pluginKey;
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
  private actions(params: CommandParams): RemirrorActions {
    // Will throw if not initialized
    this.checkInitialized();

    const extensions = this.extensions;
    const actions: RemirrorActions = {};

    // Creates the methods that take in attrs and dispatch an action into the editor
    const commands = createCommands({ extensions, params });

    Object.entries(commands).forEach(([commandName, { command, name }]) => {
      const isActive = this.initData.isActive[name] || defaultIsActive;
      const isEnabled = this.initData.isEnabled[name] || defaultIsEnabled;

      actions[commandName] = command as ActionMethods;
      actions[commandName].isActive = (attrs?: Attrs) => isActive({ attrs, command: commandName });
      actions[commandName].isEnabled = (attrs?: Attrs) => isEnabled({ attrs, command: commandName });
    });

    return actions;
  }

  /**
   * Return the object of a boolean helper.
   *
   * This can be `isActive` or `isEnabled`.
   */
  private booleanCheck(method: 'isEnabled' | 'isActive') {
    this.checkInitialized();
    const isActiveMethods: Record<string, BooleanExtensionCheck<string>> = {};

    return this.extensions.filter(hasExtensionProperty(method)).reduce(
      (acc, extension) => ({
        ...acc,
        [extension.name]: extensionPropertyMapper(method, this.params)(extension) as BooleanExtensionCheck<
          ExtensionCommands<typeof extension>
        >,
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
      .filter(extension => !extension.options.exclude.plugin)
      .map(extensionPropertyMapper('plugin', this.params)) as ProsemirrorPlugin[];

    extensionPlugins.forEach(plugin => {
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
    const nodeViews: Record<string, NodeViewMethod> = {};
    return this.extensions
      .filter(hasExtensionProperty('nodeView'))
      .filter(extension => !extension.options.exclude.nodeView)
      .reduce(
        (prevNodeViews, extension) => ({
          ...prevNodeViews,
          [extension.name]: extensionPropertyMapper('nodeView', this.params)(extension) as NodeViewMethod,
        }),
        nodeViews,
      );
  }

  /**
   * Retrieve all keymaps (how the editor responds to keyboard commands).
   */
  private keymaps() {
    this.checkInitialized();
    const extensionKeymaps = this.extensions
      .filter(hasExtensionProperty('keys'))
      .filter(extension => !extension.options.exclude.keymaps)
      .map(extensionPropertyMapper('keys', this.params));

    const mappedKeys: Record<string, CommandFunction> = {};

    for (const extensionKeymap of extensionKeymaps) {
      for (const key in extensionKeymap) {
        if (!extensionKeymap.hasOwnProperty(key)) {
          continue;
        }
        const oldCmd = mappedKeys[key];
        let newCmd = extensionKeymap[key];
        if (oldCmd) {
          newCmd = (state, dispatch, view) => {
            return oldCmd(state, dispatch, view) || extensionKeymap[key](state, dispatch, view);
          };
        }
        mappedKeys[key] = newCmd;
      }
    }
    return [keymap(mappedKeys)];
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
      .filter(extension => !extension.options.exclude.inputRules)
      .map(extensionPropertyMapper('inputRules', this.params)) as InputRule[][];

    extensionInputRules.forEach(rule => {
      rules.push(...rule);
    });

    return inputRules({ rules });
  }

  /**
   * Retrieve all the options passed in for the extension manager
   */
  private extensionOptions(): Record<string, PlainObject> {
    const options: Record<string, PlainObject> = {};
    for (const extension of this.extensions) {
      options[extension.name] = extension.options;
    }

    return options;
  }

  /**
   * Retrieve all pasteRules (rules for how the editor responds to pastedText).
   */
  private pasteRules(): ProsemirrorPlugin[] {
    this.checkInitialized();
    const pasteRules: ProsemirrorPlugin[] = [];
    const extensionPasteRules = this.extensions
      .filter(hasExtensionProperty('pasteRules'))
      .filter(extension => !extension.options.exclude.pasteRules)
      .map(extensionPropertyMapper('pasteRules', this.params)) as ProsemirrorPlugin[][];

    extensionPasteRules.forEach(rules => {
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
      .filter(extension => !extension.options.exclude.styles)
      .map(extensionPropertyMapper('styles', this.params));

    return extensionStyles;
  }
}
/**
 * Checks to see whether this is an extension manager
 *
 * @param value - the value to check
 */
export const isExtensionManager = isInstanceOf(ExtensionManager);

export interface ManagerParams {
  /**
   * The extension manager
   */
  manager: ExtensionManager;
}

export interface OnTransactionManagerParams extends TransactionParams, EditorStateParams {}
