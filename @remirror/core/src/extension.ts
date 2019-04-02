import { Interpolation } from 'emotion';
import { InputRule } from 'prosemirror-inputrules';
import { PluginKey } from 'prosemirror-state';
import { Cast } from './helpers/base';
import {
  BaseExtensionOptions,
  ExtensionBooleanFunction,
  ExtensionCommandFunction,
  ExtensionManagerParams,
  ExtensionType,
  FlexibleConfig,
  KeyboardBindings,
  ProsemirrorPlugin,
  SchemaTypeParams,
} from './types';

const defaultOptions: BaseExtensionOptions = {
  extraStyles: '',
  includeInputRules: true,
  includeKeys: true,
  includePasteRules: true,
  includePlugin: true,
  includeStyles: true,
  extraAttrs: [],
};

export abstract class Extension<GOptions extends BaseExtensionOptions = BaseExtensionOptions, GType = never> {
  public static Component: any;

  public readonly options: Required<GOptions>;
  public abstract readonly name: string;
  private pk?: PluginKey;

  constructor(options: GOptions = Cast<GOptions>({})) {
    this.options = Cast<Required<GOptions>>({
      ...defaultOptions,
      ...this.defaultOptions,
      ...options,
    });

    this.init();
  }

  /**
   * Allows for the addition of attributes to the defined schema.
   * This is only valid for
   */
  protected extraAttrs() {
    if (this.type === ExtensionType.EXTENSION) {
      throw new Error('Invalid use of extraAttrs within a plain extension.');
    }

    const extraAttrs = this.options.extraAttrs!;
    const attrs: Record<string, { default?: unknown }> = {};
    if (!extraAttrs) {
      return attrs;
    }

    for (const item of extraAttrs) {
      if (Array.isArray(item)) {
        attrs[item[0]] = { default: attrs[1] };
      } else {
        attrs[item] = {};
      }
    }
    return attrs;
  }

  protected init() {
    this.pk = new PluginKey(this.name);
  }

  get type() {
    return ExtensionType.EXTENSION;
  }

  public get pluginKey(): PluginKey {
    if (this.pk) {
      return this.pk;
    }
    this.pk = new PluginKey(this.name);
    return this.pk;
  }

  protected get defaultOptions(): Partial<GOptions> {
    return {};
  }
}

export interface Extension<GOptions extends BaseExtensionOptions = BaseExtensionOptions, GType = never> {
  /**
   * An extension can declare the extensions it requires with options needed for instantiating them
   *
   * When creating the extension manager the extension will be checked for required extension as well as
   * a quick check to see if the required extension is already included.
   *
   * TODO implement this functionality
   *
   * @alpha
   */
  readonly requiredExtensions?: RequiredExtension[];

  /**
   * Determines whether this extension is currently active (only applies to Node Extensions and Mark Extensions)
   * @param params
   */
  active?(params: ExtensionManagerParams): FlexibleConfig<ExtensionBooleanFunction>;

  /**
   * Determines whether this extension is enabled. If an object is returned then it can define different node types and
   * the criteria for checks.
   *
   * @param params
   */
  enabled?(params: ExtensionManagerParams): FlexibleConfig<ExtensionBooleanFunction>;

  /**
   * Allows extensions to register styles on the editor instance using emotion for dynamic styling.
   */
  styles?(params: ExtensionManagerParams): Interpolation;

  /**
   * Register commands for this extension.
   *
   * When an object is returned each key is first namespaced with the name of the extension before being added to the actions object
   * used for running commands and checking if a current item is active
   *
   * e.g.
   * ```ts
   * class History extends Extension {
   *   name = 'history';
   *   commands() {
   *     return {
   *       undo: COMMAND_FN,
   *       redo: COMMAND_FN,
   *     }
   *   }
   * }
   * ```
   *
   * The actions available in this case would be `historyUndo` and `historyRedo`.
   *
   * @param params
   */
  commands?(params: SchemaTypeParams<GType>): FlexibleConfig<ExtensionCommandFunction>;

  /**
   * Register paste rules for this extension.
   *
   * Paste rules are activated when text is pasted into the editor.
   */
  pasteRules?(params: SchemaTypeParams<GType>): ProsemirrorPlugin[];

  /**
   * Register input rules which are activated as a user is typing.
   */
  inputRules?(params: SchemaTypeParams<GType>): InputRule[];

  /**
   * Add key mappings for the extension
   */
  keys?(params: SchemaTypeParams<GType>): KeyboardBindings;

  /**
   * Register a plugin for the extension
   */
  plugin?(params: SchemaTypeParams<GType>): ProsemirrorPlugin;
}

export type AnyExtension = Extension<any, any>;
export type ExtensionOptions<GExtension extends Extension> = GExtension extends Extension<infer P, any>
  ? P
  : never;

/** A simpler extension constructor */
export interface ExtensionConstructor<
  GOptions extends BaseExtensionOptions,
  GExtension extends Extension<GOptions, any>
> {
  // tslint:disable-next-line: callable-types
  new (options?: GOptions): GExtension;
}

export interface RequiredExtension {
  extension: AnyExtension;
  options: any;
}
