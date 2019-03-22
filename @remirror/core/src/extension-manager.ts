import { Interpolation } from 'emotion';
import { InputRule } from 'prosemirror-inputrules';
import { keymap } from 'prosemirror-keymap';
import { Schema } from 'prosemirror-model';
import { EditorState, PluginKey } from 'prosemirror-state';
import { AnyExtension } from './extension';
import {
  createFlexibleFunctionMap,
  ExtensionMapValue,
  extensionPropertyMapper,
  hasExtensionProperty,
  isMarkExtension,
  isNodeExtension,
  transformExtensionMap,
} from './extension-manager.helpers';
import { bool, isEqual, isObject } from './helpers';
import { getPluginState } from './helpers/document';
import { NodeViewPortalContainer } from './portal-container';
import {
  ActionMethods,
  Attrs,
  CommandFunction,
  CommandParams,
  EditorSchema,
  ExtensionBooleanFunction,
  ExtensionCommandFunction,
  ExtensionManagerParams,
  MarkExtensionSpec,
  NodeExtensionSpec,
  ProsemirrorPlugin,
  RemirrorActions,
} from './types';

interface ExtensionManagerInitParams {
  /** A shortcut to pulling the editor state */
  getEditorState: () => EditorState;
  /** A shortcut to pulling the portal container */
  getPortalContainer: () => NodeViewPortalContainer;
}

export class ExtensionManager {
  /**
   * A helper static method for creating a new extension manager.
   */
  public static create(extensions: ExtensionMapValue[]) {
    return new ExtensionManager(extensions);
  }

  public getEditorState!: () => EditorState;
  public getPortalContainer!: () => NodeViewPortalContainer;
  public readonly extensions: AnyExtension[];
  private initialized = false;

  constructor(extensionMapValues: ExtensionMapValue[]) {
    this.extensions = transformExtensionMap(extensionMapValues);
  }

  /**
   * Initialize the getters.
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
    return this;
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

      if (ext.constructor === otherExt.constructor && isEqual(ext.options, otherExt.options)) {
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

  /**
   * Retrieve all plugins from the passed in extensions
   */
  public plugins(params: ExtensionManagerParams) {
    this.checkInitialized();
    const plugins: ProsemirrorPlugin[] = [];
    const extensionPlugins = this.extensions
      .filter(hasExtensionProperty('plugin'))
      .map(extensionPropertyMapper('plugin', params)) as ProsemirrorPlugin[];

    extensionPlugins.forEach(plugin => {
      plugins.push(plugin);
    });

    return plugins;
  }

  public styles(params: ExtensionManagerParams): Interpolation[] {
    const extensionStyles = this.extensions
      .filter(hasExtensionProperty('styles'))
      .map(extensionPropertyMapper('styles', params));

    return extensionStyles;
  }

  /**
   * Retrieve all keymaps (how the editor responds to keyboard commands).
   */
  public keymaps(params: ExtensionManagerParams) {
    const extensionKeymaps = this.extensions
      .filter(hasExtensionProperty('keys'))
      .map(extensionPropertyMapper('keys', params));

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
  public inputRules(params: ExtensionManagerParams) {
    const inputRules: InputRule[] = [];
    const extensionInputRules = this.extensions
      .filter(hasExtensionProperty('inputRules'))
      .map(extensionPropertyMapper('inputRules', params)) as InputRule[][];

    extensionInputRules.forEach(rules => {
      inputRules.push(...rules);
    });

    return inputRules;
  }

  /**
   * Retrieve all pasteRules (rules for how the editor responds to pastedText).
   */
  public pasteRules(params: ExtensionManagerParams): ProsemirrorPlugin[] {
    const pasteRules: ProsemirrorPlugin[] = [];
    const extensionPasteRules = this.extensions
      .filter(hasExtensionProperty('pasteRules'))
      .map(extensionPropertyMapper('pasteRules', params)) as ProsemirrorPlugin[][];

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
        return method(attrs)(params.view.state, params.view.dispatch, params.view);
      },
      checkUniqueness: true,
      arrayTransformer: (fns, params, methodFactory) => () => {
        fns.forEach(callback => {
          methodFactory(params, callback);
        });
      },
      getItemParams: (ext, params) =>
        ext.commands({
          schema: params.schema,
          getEditorState: this.getEditorState,
          getPortalContainer: this.getPortalContainer,
          ...(isMarkExtension(ext)
            ? { type: params.schema.marks[ext.name] }
            : isNodeExtension(ext)
            ? { type: params.schema.nodes[ext.name] }
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
  return createFlexibleFunctionMap<GKey, () => boolean, ExtensionBooleanFunction>({
    ctx,
    key,
    methodFactory: (_, method) => () => {
      return method();
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
      }),
  });
};

/**
 * Checks to see whether this is an extension manager
 *
 * @param value
 */
export const isExtensionManager = (value: unknown): value is ExtensionManager => {
  return isObject(value) && value instanceof ExtensionManager;
};
