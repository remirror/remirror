import { Interpolation } from 'emotion';
import { InputRule } from 'prosemirror-inputrules';
import { PluginKey } from 'prosemirror-state';
import { Cast } from './helpers/base';
import {
  ExtensionBooleanFunction,
  ExtensionCommandFunction,
  ExtensionManagerParams,
  ExtensionType,
  FlexibleConfig,
  KeyboardBindings,
  ProsemirrorPlugin,
  SchemaTypeParams,
} from './types';

export abstract class Extension<GOptions extends {} = {}, GType = never> {
  public static Component: any;

  public readonly options: Required<GOptions>;
  public abstract readonly name: string;
  private pk?: PluginKey;

  constructor(...args: keyof GOptions extends never ? [] : [GOptions?]) {
    if (args[0]) {
      this.options = Cast<Required<GOptions>>({
        ...this.defaultOptions,
        ...args[0],
      });
    } else {
      this.options = Cast<Required<GOptions>>(this.defaultOptions);
    }
    this.init();
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

export interface Extension<GOptions extends {} = {}, GType = never> {
  /**
   * An extension can declare the extensions it requires with options needed for instantiating them
   *
   * When creating the extension manager the extension will be checked for required extension as well as
   * a quick check to see if the required extension is already included.
   *
   * TODO implement this functionality
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
   * Allows extensions to register styles on the editor instance using emotion for dynamic styling
   */
  styles?(params: ExtensionManagerParams): Interpolation;

  /**
   * Register commands for this extension. If an object returned the commands are
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

export interface ExtensionConstructor<
  GExtension extends Extension,
  GOpts extends ExtensionOptions<GExtension>
> {
  // tslint:disable-next-line: callable-types
  new (options: GOpts): GExtension;
}

/** A simpler extension constructor */
export interface SimpleExtensionConstructor<GOptions extends {}, GExtension extends Extension<GOptions>> {
  // tslint:disable-next-line: callable-types
  new (options?: GOptions): GExtension;
}

export interface RequiredExtension {
  extension: AnyExtension;
  options: any;
}
