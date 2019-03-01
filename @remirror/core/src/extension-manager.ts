import { InputRule } from 'prosemirror-inputrules';
import { keymap } from 'prosemirror-keymap';
import { Schema } from 'prosemirror-model';
import { EditorState, PluginKey } from 'prosemirror-state';
import { AnyExtension } from './extension';
import {
  createFlexibleFunctionMap,
  extensionPropertyMapper,
  hasExtensionProperty,
  isMarkExtension,
  isNodeExtension,
} from './extension-manager.helpers';
import { NodeViewPortalContainer } from './portal-container';
import {
  ActionMethods,
  CommandParams,
  EditorSchema,
  ExtensionBooleanFunction,
  ExtensionCommandFunction,
  MarkExtensionSpec,
  NodeExtensionSpec,
  ProsemirrorPlugin,
  RemirrorActions,
  SchemaParams,
} from './types';

export class ExtensionManager {
  constructor(
    public readonly extensions: AnyExtension[],
    public readonly getEditorState: () => EditorState,
    public readonly getPortalContainer: () => NodeViewPortalContainer,
  ) {}

  /**
   * Filters through all provided extensions and picks the nodes
   */
  public get nodes() {
    const initialEditorNodes: Record<string, NodeExtensionSpec> = {};
    return this.extensions.filter(isNodeExtension).reduce(
      (nodes, { name, schema }) => ({
        ...nodes,
        [name]: schema,
      }),
      initialEditorNodes,
    );
  }

  /**
   * Filters through all provided extensions and picks the marks
   */
  public get marks() {
    const initialEditorMarks: Record<string, MarkExtensionSpec> = {};
    return this.extensions.filter(isMarkExtension).reduce(
      (marks, { name, schema }) => ({
        ...marks,
        [name]: schema,
      }),
      initialEditorMarks,
    );
  }

  /**
   * Dynamically create the editor schema based on the extensions that have been passed in.
   */
  public createSchema(): EditorSchema {
    return new Schema({ nodes: this.nodes, marks: this.marks });
  }

  /**
   * Currently an extension can have only one pluginKey but multiple plugins - which is a potential bug.
   * TODO enhance pluginKey assignment check if name isn't in use
   */
  public get pluginKeys() {
    const initialPluginKeys: Record<string, PluginKey> = {};
    return this.extensions
      .filter(extension => extension.plugins)
      .reduce(
        (allPluginKeys, { pluginKey, name }) => ({ ...allPluginKeys, ...{ [name]: pluginKey } }),
        initialPluginKeys,
      );
  }

  /**
   * Retrieve all plugins from the passed in extensions
   */
  public plugins({ schema }: SchemaParams): ProsemirrorPlugin[] {
    const extensionPlugins = this.extensions
      .filter(hasExtensionProperty('plugins'))
      .map(extensionPropertyMapper('plugins', schema)) as ProsemirrorPlugin[][];

    return extensionPlugins.reduce((allPlugins, plugins) => [...allPlugins, ...plugins], []);
  }

  /**
   * Retrieve all keymaps (how the editor responds to keyboard commands).
   */
  public keymaps({ schema }: SchemaParams): ProsemirrorPlugin[] {
    const extensionKeymaps = this.extensions
      .filter(hasExtensionProperty('keys'))
      .map(extensionPropertyMapper('keys', schema));
    return extensionKeymaps.map(keys => keymap(keys));
  }

  /**
   * Retrieve all inputRules (how the editor responds to text matching certain rules).
   */
  public inputRules({ schema }: SchemaParams) {
    const extensionInputRules = this.extensions
      .filter(hasExtensionProperty('inputRules'))
      .map(extensionPropertyMapper('inputRules', schema)) as InputRule[][];

    return extensionInputRules.reduce((allInputRules, inputRules) => [...allInputRules, ...inputRules], []);
  }

  /**
   * Retrieve all pasteRules (rules for how the editor responds to pastedText).
   */
  public pasteRules({ schema }: SchemaParams): ProsemirrorPlugin[] {
    const extensionPasteRules = this.extensions
      .filter(hasExtensionProperty('pasteRules'))
      .map(extensionPropertyMapper('pasteRules', schema)) as ProsemirrorPlugin[][];

    return extensionPasteRules.reduce((allPasteRules, pasteRules) => [...allPasteRules, ...pasteRules], []);
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
    const initialActions: RemirrorActions = {};
    const commands = this.commands(params);
    const active = this.active(params);
    const enabled = this.enabled(params);

    return Object.entries(commands).reduce((accumulatedActions, [name, command]) => {
      const action: ActionMethods = {
        run: command,
        isActive: active[name] ? active[name] : () => false,
        isEnabled: enabled[name] ? enabled[name] : () => true,
      };
      return {
        ...accumulatedActions,
        [name]: action,
      };
    }, initialActions);
  }

  /**
   * Generate all the actions for usage within the UI.
   *
   * Typically actions are used to create interactive menus.
   * For example a menu can use a command to toggle bold.
   */
  private commands = createFlexibleFunctionMap<'commands', () => void, ExtensionCommandFunction>({
    ctx: this,
    key: 'commands',
    methodFactory: (params, method) => () => {
      if (!params.isEditable()) {
        return false;
      }
      params.view.focus();
      return method()(params.view.state, params.view.dispatch);
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
        ...(isMarkExtension(ext)
          ? { type: params.schema.marks[ext.name] }
          : isNodeExtension(ext)
          ? { type: params.schema.nodes[ext.name] }
          : {}),
      }),
  });

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
        .every(Boolean);
    },
    getItemParams: (extension, params) =>
      extension[key]({
        schema: params.schema,
        getEditorState: ctx.getEditorState,
      }),
  });
};
