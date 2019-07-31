import { Interpolation } from '@emotion/core';
import { InputRule, inputRules } from 'prosemirror-inputrules';
import { keymap } from 'prosemirror-keymap';
import { Schema } from 'prosemirror-model';
import { EditorState, PluginKey } from 'prosemirror-state';
import { ComponentType } from 'react';
import { isMarkExtension, isNodeExtension } from './extension-helpers';
import {
  createCommands,
  createExtensionTags,
  createHelpers,
  defaultIsActive,
  defaultIsEnabled,
  extensionPropertyMapper,
  hasExtensionProperty,
  ignoreFunctions,
  transformExtensionMap,
} from './extension-manager.helpers';
import {
  ActionsFromExtensionList,
  AnyExtension,
  FlexibleExtension,
  MappedHelpersFromExtensionList,
  MarkNames,
  NodeNames,
  PlainNames,
} from './extension-types';
import { bool, isEqual, isFunction, isInstanceOf } from './helpers';
import { createDocumentNode, CreateDocumentNodeParams, getPluginState } from './helpers/document';
import { MarkExtension } from './mark-extension';
import { NodeExtension } from './node-extension';
import { PortalContainer } from './portal-container';
import {
  ActionMethod,
  AnyActions,
  AnyHelpers,
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
  TransactionParams,
} from './types';

export interface ExtensionManagerData<
  GActions = AnyActions,
  GHelpers = AnyHelpers,
  GNodes extends string = string,
  GMarks extends string = string,
  GPlain extends string = string,
  GNames extends string = GNodes | GMarks | GPlain
> {
  schema: EditorSchema<GNodes, GMarks>;
  styles: Interpolation;
  directPlugins: ProsemirrorPlugin[];
  plugins: ProsemirrorPlugin[];
  nodeViews: Record<string, NodeViewMethod>;
  keymaps: ProsemirrorPlugin[];
  inputRules: ProsemirrorPlugin;
  pasteRules: ProsemirrorPlugin[];
  actions: GActions;
  helpers: GHelpers;
  view: EditorView<EditorSchema<GNodes, GMarks>>;
  isActive: Record<GNames, BooleanExtensionCheck>;
  isEnabled: Record<GNames, BooleanExtensionCheck>;
  options: Record<GNames, PlainObject>;
  tags: ExtensionTags<GNodes, GMarks, GPlain>;
}

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
 * const manager = new ExtensionManager([ new DocExtension(), new TextExtension(), new ParagraphExtension()])
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
export class ExtensionManager<GExtensions extends AnyExtension[] = AnyExtension[]>
  implements ExtensionManagerInitParams {
  /**
   * A static method for creating a new extension manager.
   */
  public static create<GExtensions extends AnyExtension[] = AnyExtension[]>(
    extensions: Array<FlexibleExtension<GExtensions[number]>>,
  ) {
    return new ExtensionManager<GExtensions>(extensions);
  }

  /**
   * Retrieve the latest state of the editor this manager is responsible for.
   * This is only available after the first Initialization.
   */
  public getState!: () => EditorState;

  /**
   * Retrieve the portal container for any custom nodeViews. This is only
   * available after the first Initialization.
   */
  public portalContainer!: PortalContainer;

  /**
   * The extensions stored by this manager
   */
  public readonly extensions: GExtensions;

  /**
   * Whether or not the manager has been initialized. This happens after init is
   * called.
   */
  private initialized = false;

  /**
   * The extension manager data which is stored after Initialization
   */
  private initData: this['_D'] = {} as this['_D'];

  /**
   * Retrieve the specified action.
   */
  private getActions = (name: keyof this['_A']) => this.initData.actions[name];

  /**
   * Retrieve the specified helper.
   */
  private getHelpers = (name: keyof this['_H']) => this.initData.helpers[name];

  /**
   * Creates the extension manager which is used to simplify the management of
   * the different facets of building an editor with
   */
  constructor(extensionMapValues: Array<FlexibleExtension<GExtensions[number]>>) {
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

    this.initData.helpers = this.helpers();

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
      .map(extension => extension.attributes!(this.params))
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
    const nodes: Record<this['_N'], NodeExtensionSpec> = {} as any;

    this.extensions.filter(isNodeExtension).forEach(extension => {
      const { name, schema } = extension as NodeExtension;
      nodes[name as this['_N']] = schema;
    });

    return nodes;
  }

  /**
   * Filters through all provided extensions and picks the marks
   */
  get marks() {
    const marks: Record<this['_M'], MarkExtensionSpec> = {} as any;

    this.extensions.filter(isMarkExtension).forEach(extension => {
      const { name, schema } = extension as MarkExtension;
      marks[name as this['_M']] = schema;
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
      portalContainer: this.portalContainer,
      getState: this.getState,
      getActions: this.getActions as any,
      getHelpers: this.getHelpers as any,
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
      onTransaction!({ ...params, ...this.params, view: this.data.view });
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
        return extension.ssrTransformer!(prevElement, this.params) as JSX.Element;
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
  private createSchema(): EditorSchema<this['_N'], this['_M']> {
    return new Schema({ nodes: this.nodes, marks: this.marks });
  }

  /**
   * Retrieve all the extension plugin keys
   */
  private get pluginKeys() {
    const pluginKeys: Record<this['_N'], PluginKey> = {} as any;
    this.extensions
      .filter(extension => extension.plugin)
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
  private actions(params: CommandParams): this['_A'] {
    // Will throw if not initialized
    this.checkInitialized();

    const extensions = this.extensions;
    const actions: AnyActions = {};

    // Creates the methods that take in attrs and dispatch an action into the editor
    const commands = createCommands({ extensions, params });

    Object.entries(commands).forEach(([commandName, { command, name }]) => {
      const isActive = this.initData.isActive[name as this['_Names']] || defaultIsActive;
      const isEnabled = this.initData.isEnabled[name as this['_Names']] || defaultIsEnabled;

      actions[commandName] = command as ActionMethod;
      actions[commandName].isActive = (attrs?: Attrs) => isActive({ attrs, command: commandName });
      actions[commandName].isEnabled = (attrs?: Attrs) => isEnabled({ attrs, command: commandName });
    });

    return actions as any;
  }

  private helpers(): this['_H'] {
    const helpers = {} as AnyHelpers;
    const methods = createHelpers({ extensions: this.extensions, params: this.params });

    Object.entries(methods).forEach(([helperName, helper]) => {
      helpers[helperName] = helper;
    });

    return helpers as any;
  }

  /**
   * Return the object of a boolean helper.
   *
   * This can be `isActive` or `isEnabled`.
   */
  private booleanCheck(method: 'isEnabled' | 'isActive') {
    // Will throw if not initialized
    this.checkInitialized();

    const isActiveMethods: Record<this['_Names'], BooleanExtensionCheck> = {} as any;

    return this.extensions.filter(hasExtensionProperty(method)).reduce(
      (acc, extension) => ({
        ...acc,
        [extension.name]: extensionPropertyMapper(method, this.params)(extension),
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
    const extensionKeymaps: Array<Record<string, CommandFunction>> = this.extensions
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

  /* The following are placed at the bottom to prevent them from appearing at the top
  of autosuggestions when accessing the manger. The names are prefixed with `z` to place them at the
  bottom of alphabetical suggestion lists. */

  /**
   * `NodeNames`
   *
   * Type inference hack for node extension names.
   * Also provides a shorthand way for accessing types on a class.
   *
   * DO NOT USE (on penalty of intense confusion)
   */
  public readonly _N!: NodeNames<this['extensions']>;

  /**
   * `MarkNames`
   *
   * Type inference hack for mark extension names.
   * Also provides a shorthand way for accessing types on a class.
   *
   * DO NOT USE (on penalty of intense confusion)
   */
  public readonly _M!: MarkNames<this['extensions']>;

  /**
   * `PlainNames`
   *
   * Type inference hack for plain extension names.
   * Also provides a shorthand way for accessing types on a class.
   *
   * DO NOT USE (on penalty of intense confusion)
   */
  public readonly _P!: PlainNames<this['extensions']>;

  /**
   * `AllNames`
   *
   * Type inference hack for all extension names.
   * Also provides a shorthand way for accessing types on a class.
   *
   * DO NOT USE (on penalty of intense confusion)
   */
  public readonly _Names!: this['_P'] | this['_N'] | this['_M'];

  /**
   * `Actions`
   *
   * Type inference hack for all the actions this manager provides.
   * Also provides a shorthand way for accessing types on a class.
   *
   * DO NOT USE (on penalty of intense confusion)
   */
  public readonly _A!: ActionsFromExtensionList<this['extensions']>;

  /**
   * `Helpers`
   *
   * Type inference hack for all the helpers this manager provides.
   * Also provides a shorthand way for accessing types on a class.
   *
   * DO NOT USE (on penalty of intense confusion)
   */
  public readonly _H!: MappedHelpersFromExtensionList<this['extensions']>;

  /**
   * `ExtensionData`
   *
   * Type inference hack for all the extensionData that this manager provides.
   * Also provides a shorthand way for accessing types on a class.
   *
   * DO NOT USE (on penalty of intense confusion)
   */
  public readonly _D!: ExtensionManagerData<this['_A'], this['_H'], this['_N'], this['_M'], this['_P']>;
}
/**
 * Checks to see whether this is an extension manager
 *
 * @param value - the value to check
 */
export const isExtensionManager = isInstanceOf(ExtensionManager);

export interface ManagerParams<GExtensions extends AnyExtension[] = AnyExtension[]> {
  /**
   * The extension manager
   */
  manager: ExtensionManager<GExtensions>;
}

export interface OnTransactionManagerParams extends TransactionParams, EditorStateParams {}
