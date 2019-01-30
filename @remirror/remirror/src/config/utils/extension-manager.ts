import { InputRule } from 'prosemirror-inputrules';
import { keymap } from 'prosemirror-keymap';
import { Schema } from 'prosemirror-model';
import { EditorState, PluginKey } from 'prosemirror-state';
import { AnyFunc } from 'simplytyped';
import {
  ActionMethods,
  CommandParams,
  ExtensionActiveFunction,
  ExtensionCommandFunction,
  ExtensionEnabledFunction,
  ExtensionType,
  FlexibleConfig,
  IExtension,
  IMarkExtension,
  INodeExtension,
  MarkExtensionSpecification,
  NodeExtensionSpecification,
  ProsemirrorPlugin,
  RemirrorActions,
  SchemaParams,
} from '../../types';

export class ExtensionManager {
  constructor(
    public readonly extensions: IExtension[],
    private getEditorState: () => EditorState,
  ) {}

  get nodes() {
    const initialEditorNodes: Record<string, NodeExtensionSpecification> = {};
    return this.extensions.filter(isNodeExtension).reduce(
      (nodes, { name, schema }) => ({
        ...nodes,
        [name]: schema,
      }),
      initialEditorNodes,
    );
  }

  get marks() {
    const initialEditorMarks: Record<string, MarkExtensionSpecification> = {};
    return this.extensions.filter(isMarkExtension).reduce(
      (marks, { name, schema }) => ({
        ...marks,
        [name]: schema,
      }),
      initialEditorMarks,
    );
  }

  /**
   * Currently an extension can have only one pluginKey but multiple plugins - which is a potential bug.
   * TODO enhance pluginKey assignment
   */
  get pluginKeys() {
    const initialPluginKeys: Record<string, PluginKey> = {};
    return this.extensions
      .filter(extension => extension.plugins)
      .reduce(
        (allPluginKeys, { pluginKey, name }) => ({ ...allPluginKeys, ...{ [name]: pluginKey } }),
        initialPluginKeys,
      );
  }

  get plugins() {
    const initialPlugins: ProsemirrorPlugin[] = [];
    return this.extensions
      .filter(extension => extension.plugins)
      .reduce((allPlugins, { plugins }) => [...allPlugins, ...(plugins || [])], initialPlugins);
  }

  public keymaps({ schema }: SchemaParams): ProsemirrorPlugin[] {
    const extensionKeymaps = this.extensions
      .filter(hasExtensionProperty('keys'))
      .map(extensionPropertyMapper('keys', schema));
    return extensionKeymaps.map(keys => keymap(keys));
  }

  public inputRules({ schema }: SchemaParams) {
    const extensionInputRules = this.extensions
      .filter(hasExtensionProperty('inputRules'))
      .map(extensionPropertyMapper('inputRules', schema)) as InputRule[][];

    return extensionInputRules.reduce(
      (allInputRules, inputRules) => [...allInputRules, ...inputRules],
      [],
    );
  }

  public pasteRules({ schema }: SchemaParams): ProsemirrorPlugin[] {
    const extensionPasteRules = this.extensions
      .filter(hasExtensionProperty('pasteRules'))
      .map(extensionPropertyMapper('pasteRules', schema)) as ProsemirrorPlugin[][];

    return extensionPasteRules.reduce(
      (allPasteRules, pasteRules) => [...allPasteRules, ...pasteRules],
      [],
    );
  }

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

  private active = createFlexibleFunctionMap<'active', () => boolean, ExtensionActiveFunction>({
    ctx: this,
    key: 'active',
    methodFactory: (_, method) => () => {
      return method();
    },
    checkUniqueness: false,
    arrayTransformer: (fns, params, methodFactory) => () => {
      return fns
        .map(callback => {
          methodFactory(params, callback);
        })
        .every(Boolean);
    },
    getItemParams: (ext, params) =>
      ext.active({
        schema: params.schema,
        getEditorState: this.getEditorState,
      }),
  });

  private enabled = createFlexibleFunctionMap<'enabled', () => boolean, ExtensionEnabledFunction>({
    ctx: this,
    key: 'enabled',
    methodFactory: (_, method) => () => {
      return method();
    },
    checkUniqueness: false,
    arrayTransformer: (fns, params, methodFactory) => () => {
      return fns
        .map(callback => {
          methodFactory(params, callback);
        })
        .every(Boolean);
    },
    getItemParams: (ext, params) =>
      ext.enabled({
        schema: params.schema,
        getEditorState: this.getEditorState,
      }),
  });
}

type MethodFactory<GMappedFunc extends AnyFunc, GFunc extends AnyFunc> = (
  params: CommandParams,
  method: GFunc,
) => GMappedFunc;

const isNameUnique = (name: string, set: Set<string>, type = 'extension') => {
  // Put this check behind a development flag later
  if (set.has(name)) {
    // tslint:disable-next-line:no-console
    console.error(
      `There is a naming conflict for the name: ${name} used in this type: ${type}. Please rename to avoid runtime errors.`,
    );
    return;
  }
  set.add(name);
};

const createFlexibleFunctionMap = <
  GKey extends keyof IExtension,
  GMappedFunc extends AnyFunc,
  GFunc extends AnyFunc
>({
  key,
  checkUniqueness,
  getItemParams,
  methodFactory,
  arrayTransformer,
  ctx,
}: {
  checkUniqueness: boolean;
  key: GKey;
  getItemParams: (
    ext: IExtension & Pick<Required<IExtension>, GKey>,
    params: CommandParams,
  ) => FlexibleConfig<GFunc>;
  methodFactory: MethodFactory<GMappedFunc, GFunc>;
  arrayTransformer: (
    fns: GFunc[],
    params: CommandParams,
    methodFactory: MethodFactory<GMappedFunc, GFunc>,
  ) => GMappedFunc;
  ctx: ExtensionManager;
}) => (params: CommandParams): Record<string, GMappedFunc> => {
  const initialItems: Record<string, GMappedFunc> = {};
  const names = new Set<string>();

  return ctx.extensions
    .filter(hasExtensionProperty(key))
    .reduce((accumulatedItems, currentExtension) => {
      const { name } = currentExtension;
      if (checkUniqueness) {
        isNameUnique(name, names);
      }

      const items: Record<string, GMappedFunc> = {};
      const item = getItemParams(currentExtension, params);
      if (Array.isArray(item)) {
        items[name] = arrayTransformer(item, params, methodFactory);
      } else if (typeof item === 'function') {
        items[name] = methodFactory(params, item);
      } else {
        Object.entries(item).forEach(([commandName, commandValue]) => {
          if (checkUniqueness) {
            isNameUnique(commandName, names);
          }
          items[commandName] = Array.isArray(commandValue)
            ? arrayTransformer(commandValue, params, methodFactory)
            : methodFactory(params, commandValue);
        });
      }

      return {
        ...accumulatedItems,
        ...items,
      };
    }, initialItems);
};

const isNodeExtension = (ext: IExtension): ext is INodeExtension => ext.type === ExtensionType.NODE;
const isMarkExtension = (ext: IExtension): ext is IMarkExtension => ext.type === ExtensionType.MARK;

const hasExtensionProperty = <GExt extends IExtension, GKey extends keyof GExt>(property: GKey) => (
  ext: GExt,
): ext is GExt & Pick<Required<GExt>, GKey> => Boolean(ext[property]);

type ExtensionMethodProperties = 'inputRules' | 'pasteRules' | 'keys';
const extensionPropertyMapper = <
  GExt extends IExtension,
  GExtensionMethodProp extends ExtensionMethodProperties
>(
  property: GExtensionMethodProp,
  schema: Schema,
) => (extension: GExt) =>
  isNodeExtension(extension)
    ? extension[property]({ schema, type: schema.nodes[extension.name] })
    : isMarkExtension(extension)
    ? extension[property]({ schema, type: schema.marks[extension.name] })
    : extension[property]({ schema });
