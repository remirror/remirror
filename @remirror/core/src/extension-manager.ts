import { cx, Interpolation } from 'emotion';
import { InputRule, inputRules } from 'prosemirror-inputrules';
import { keymap } from 'prosemirror-keymap';
import { Schema } from 'prosemirror-model';
import { EditorState, PluginKey } from 'prosemirror-state';
import { AnyExtension } from './extension';
import {
  createFlexibleFunctionMap,
  extensionPropertyMapper,
  FlexibleExtension,
  hasExtensionProperty,
  ignoreFunctions,
  isMarkExtension,
  isNodeExtension,
  transformExtensionMap,
} from './extension-manager.helpers';
import { bool, isEqual, isFunction, isObject } from './helpers';
import { createDocumentNode, CreateDocumentNodeParams, getPluginState } from './helpers/document';
import { NodeViewPortalContainer } from './portal-container';
import {
  ActionMethods,
  Attrs,
  CommandFunction,
  CommandParams,
  EditorSchema,
  EditorView,
  ExtensionBooleanFunction,
  ExtensionCommandFunction,
  ExtensionManagerParams,
  MarkExtensionSpec,
  NodeExtensionSpec,
  NodeViewMethod,
  Omit,
  ProsemirrorPlugin,
  RemirrorActions,
} from './types';

export interface ExtensionManagerInitParams {
  /**
   *  A shortcut to pulling the editor state
   */
  getEditorState: () => EditorState;

  /**
   *  A shortcut to pulling the portal container
   */
  getPortalContainer: () => NodeViewPortalContainer;
}

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
  markAttrs: Record<string, Record<string, string>>;
  view: EditorView;
  attributes: Attrs;
}

export class ExtensionManager {
  /**
   * A helper static method for creating a new extension manager.
   */
  public static create(extensions: FlexibleExtension[]) {
    return new ExtensionManager(extensions);
  }

  public getEditorState!: () => EditorState;
  public getPortalContainer!: () => NodeViewPortalContainer;
  public readonly extensions: AnyExtension[];
  private initialized = false;
  private initData: ExtensionManagerData = {} as ExtensionManagerData;

  get schema() {
    return this.initData.schema;
  }

  get data() {
    if (!this.initialized) {
      throw new Error('Extension Manager must  be initialized before attempting to access the data');
    }

    return this.initData;
  }

  constructor(extensionMapValues: FlexibleExtension[]) {
    this.extensions = transformExtensionMap(extensionMapValues);

    // Initialize the schema immediately since this doesn't ever change.
    this.initData.schema = this.createSchema();
  }

  /**
   * Initialize manager with all required initial data.
   */
  public init({ getEditorState, getPortalContainer }: ExtensionManagerInitParams) {
    if (this.initialized) {
      console.warn(
        'This manager is already in use. Make sure not to use the same manager for more than one editor as this will cause problems with conflicting editor schema.',
      );
    }

    this.getEditorState = getEditorState;
    this.getPortalContainer = getPortalContainer;
    this.initialized = true;

    this.initData.styles = this.styles();
    this.initData.directPlugins = this.plugins();
    this.initData.nodeViews = this.nodeViews();
    this.initData.keymaps = this.keymaps();
    this.initData.inputRules = this.inputRules();
    this.initData.pasteRules = this.pasteRules();
    this.initData.attributes = this.attributes();

    this.initData.plugins = [
      ...this.initData.directPlugins,
      this.initData.inputRules,
      ...this.initData.pasteRules,
      ...this.initData.keymaps,
    ];

    return this;
  }

  public initView(view: EditorView) {
    this.initData.view = view;
    this.initData.actions = this.actions({
      ...this.params,
      view,
      isEditable: () =>
        bool(
          isFunction(view.props.editable) ? view.props.editable(this.getEditorState()) : view.props.editable,
        ),
    });
  }

  /**
   * Utility getter for accessing the schema params
   */
  private get params(): ExtensionManagerParams {
    return {
      schema: this.initData.schema,
      getEditorState: this.getEditorState,
      getPortalContainer: this.getPortalContainer,
    };
  }

  /**
   * Checks whether two manager's are equal. Can be used to determine whether
   * a change in props has caused anything to actually change and prevent a rerender.
   *
   * ExtensionManagers are equal when
   * - They have the same number of extensions
   * - Same order of extensions
   * - Each extension has the same options
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
   * Checks to see if the extension manager has been initialized and throws if not
   */
  private checkInitialized() {
    if (!this.initialized) {
      throw new Error(
        'Before using the extension manager it must be initialized with a getPortalContainer and editorState',
      );
    }
  }

  /**
   * Filters through all provided extensions and picks the nodes
   */
  public get nodes() {
    const nodes: Record<string, NodeExtensionSpec> = {};
    this.extensions.filter(isNodeExtension).forEach(({ name, schema }) => {
      nodes[name] = schema;
    });
    return nodes;
  }

  /**
   * Filters through all provided extensions and picks the marks
   */
  public get marks() {
    const marks: Record<string, MarkExtensionSpec> = {};
    this.extensions.filter(isMarkExtension).forEach(({ name, schema }) => {
      marks[name] = schema;
    });
    return marks;
  }

  /**
   * Dynamically create the editor schema based on the extensions that have been passed in.
   */
  public createSchema(): EditorSchema {
    return new Schema({ nodes: this.nodes, marks: this.marks });
  }

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
   * Get all the extension plugin keys
   */
  public get pluginKeys() {
    const pluginKeys: Record<string, PluginKey> = {};
    this.extensions
      .filter(extension => extension.plugin)
      .forEach(({ pluginKey, name }) => {
        pluginKeys[name] = pluginKey;
      });

    return pluginKeys;
  }

  public attributes() {
    let combinedAttributes: Attrs = {};
    this.extensions
      .filter(hasExtensionProperty('attributes'))
      .filter(extension => extension.options.includeOnInitView)
      .map(extension => extension.attributes(this.params))
      .reverse()
      .forEach(attrs => {
        combinedAttributes = {
          ...combinedAttributes,
          ...attrs,
          class: cx(combinedAttributes.class as string, attrs.class as string),
        };
      });

    return combinedAttributes;
  }

  /**
   * Retrieve all plugins from the passed in extensions
   */
  public plugins() {
    this.checkInitialized();
    const plugins: ProsemirrorPlugin[] = [];
    const extensionPlugins = this.extensions
      .filter(hasExtensionProperty('plugin'))
      .filter(extension => extension.options.includePlugin)
      .map(extensionPropertyMapper('plugin', this.params)) as ProsemirrorPlugin[];

    extensionPlugins.forEach(plugin => {
      plugins.push(plugin);
    });

    return plugins;
  }

  /**
   * Retrieve the nodeView created on the extensions for use within prosemirror state
   */
  public nodeViews() {
    this.checkInitialized();
    const nodeViews: Record<string, NodeViewMethod> = {};
    return this.extensions
      .filter(hasExtensionProperty('nodeView'))
      .filter(extension => extension.options.includeNodeView)
      .reduce(
        (prevNodeViews, extension) => ({
          ...prevNodeViews,
          [extension.name]: extensionPropertyMapper('nodeView', this.params)(extension) as NodeViewMethod,
        }),
        nodeViews,
      );
  }

  /**
   * Extensions can register custom styles for the editor. This retrieves them.
   */
  public styles(): Interpolation[] {
    const extensionStyles = this.extensions
      .filter(hasExtensionProperty('styles'))
      .filter(extension => extension.options.includeStyles)
      .map(extensionPropertyMapper('styles', this.params));

    return extensionStyles;
  }

  /**
   * Retrieve all keymaps (how the editor responds to keyboard commands).
   */
  public keymaps() {
    const extensionKeymaps = this.extensions
      .filter(hasExtensionProperty('keys'))
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
   * Retrieve all inputRules (how the editor responds to text matching certain rules).
   */
  public inputRules() {
    const rules: InputRule[] = [];
    const extensionInputRules = this.extensions
      .filter(hasExtensionProperty('inputRules'))
      .filter(extension => extension.options.includeInputRules)
      .map(extensionPropertyMapper('inputRules', this.params)) as InputRule[][];

    extensionInputRules.forEach(rule => {
      rules.push(...rule);
    });

    return inputRules({ rules });
  }

  /**
   * Retrieve all pasteRules (rules for how the editor responds to pastedText).
   */
  public pasteRules(): ProsemirrorPlugin[] {
    const pasteRules: ProsemirrorPlugin[] = [];
    const extensionPasteRules = this.extensions
      .filter(hasExtensionProperty('pasteRules'))
      .filter(extension => extension.options.includePasteRules)
      .map(extensionPropertyMapper('pasteRules', this.params)) as ProsemirrorPlugin[][];

    extensionPasteRules.forEach(rules => {
      pasteRules.push(...rules);
    });

    return pasteRules;
  }

  /**
   * Create the actions which are passed into the render props.
   *
   * RemirrorActions allow for checking if a node / mark is active, enabled, and also running the command.
   *
   * - `isActive` defaults to a function returning false
   * - `isEnabled` defaults to a function returning true
   */
  public actions(params: CommandParams): RemirrorActions {
    this.checkInitialized();

    const actions: RemirrorActions = {};
    const commands = this.commands(params);
    const active = this.active(params);
    const enabled = this.enabled(params);

    Object.entries(commands).forEach(([name, command]) => {
      const action: ActionMethods = {
        command,
        isActive: active[name] ? active[name] : () => false,
        isEnabled: enabled[name] ? enabled[name] : () => true,
      };
      actions[name] = action;
    });

    return actions;
  }

  /**
   * Retrieve the state for a given extension name. This will throw an error if the extension doesn't exist.
   */
  public getPluginState<GState>(name: string): GState {
    this.checkInitialized();
    const key = this.pluginKeys[name];
    if (!key) {
      throw new Error(`Cannot retrieve state for an extension: ${name} which doesn\'t exist`);
    }
    return getPluginState<GState>(key, this.getEditorState());
  }

  /**
   * Generate all the actions for usage within the UI.
   *
   * Typically actions are used to create interactive menus.
   * For example a menu can use a command to toggle bold.
   */
  private commands = createFlexibleFunctionMap<'commands', (attrs?: Attrs) => void, ExtensionCommandFunction>(
    {
      ctx: this,
      key: 'commands',
      methodFactory: (params, method) => (attrs?: Attrs) => {
        if (!params.isEditable()) {
          return false;
        }
        params.view.focus();
        return method(attrs)(params.getEditorState(), params.view.dispatch, params.view);
      },
      checkUniqueness: true,
      arrayTransformer: (fns, params, methodFactory) => () => {
        fns.forEach(callback => {
          methodFactory(params, callback);
        });
      },
      getItemParams: (extension, params) =>
        extension.commands({
          schema: params.schema,
          getEditorState: this.getEditorState,
          getPortalContainer: this.getPortalContainer,
          ...(isMarkExtension(extension)
            ? { type: params.schema.marks[extension.name] }
            : isNodeExtension(extension)
            ? { type: params.schema.nodes[extension.name] }
            : {}),
        }),
    },
  );

  /**
   * Creates methods determining whether a node is active or inactive
   */
  private active = booleanFlexibleFunctionMap('active', this);

  /**
   * Creates methods determining whether a node / mark is enabled
   */
  private enabled = booleanFlexibleFunctionMap('enabled', this);
}

/**
 * A helper specifically for generating RemirrorActions active and enabled methods
 */
const booleanFlexibleFunctionMap = <GKey extends 'enabled' | 'active'>(key: GKey, ctx: ExtensionManager) => {
  return createFlexibleFunctionMap<GKey, (attrs?: Attrs) => boolean, ExtensionBooleanFunction>({
    ctx,
    key,
    methodFactory: (_, method) => (attrs?: Attrs) => {
      return method(attrs);
    },
    checkUniqueness: false,
    arrayTransformer: (functions, params, methodFactory) => () => {
      return functions
        .map(callback => {
          methodFactory(params, callback);
        })
        .every(bool);
    },
    getItemParams: (extension, params) =>
      extension[key]({
        schema: params.schema,
        getEditorState: ctx.getEditorState,
        getPortalContainer: ctx.getPortalContainer,
        ...(isMarkExtension(extension)
          ? { type: params.schema.marks[extension.name] }
          : isNodeExtension(extension)
          ? { type: params.schema.nodes[extension.name] }
          : {}),
      }),
  });
};

/**
 * Checks to see whether this is an extension manager
 *
 * @param value - the value to check
 */
export const isExtensionManager = (value: unknown): value is ExtensionManager => {
  return isObject(value) && value instanceof ExtensionManager;
};
