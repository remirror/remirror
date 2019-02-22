import { InputRule } from 'prosemirror-inputrules';
import { PluginKey } from 'prosemirror-state';
import { Cast } from './helpers';
import {
  ExtensionBooleanFunction,
  ExtensionCommandFunction,
  ExtensionType,
  FlexibleConfig,
  KeyboardBindings,
  ProsemirrorPlugin,
  SchemaTypeParams,
  SchemaWithStateParams,
} from './types';

export abstract class Extension<GOptions extends {} = {}, GType = never> {
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

  get defaultOptions(): Partial<GOptions> {
    return {};
  }
}

export interface Extension<GOptions extends {} = {}, GType = never> {
  /**
   * Determines whether this extension is currently active (only applies to Node Extensions and Mark Extensions)
   * @param params
   */
  active?(params: SchemaWithStateParams): FlexibleConfig<ExtensionBooleanFunction>;

  /**
   * Determines whether this extension is enabled. If an object is returned then it can define different node types and
   * the criteria for checks.
   *
   * @param params
   */
  enabled?(params: SchemaWithStateParams): FlexibleConfig<ExtensionBooleanFunction>;

  /**
   * Register commands for this extension. If an object returned the commands are
   * @param params
   */
  commands?(params: SchemaTypeParams<GType>): FlexibleConfig<ExtensionCommandFunction>;
  pasteRules?(params: SchemaTypeParams<GType>): ProsemirrorPlugin[];
  inputRules?(params: SchemaTypeParams<GType>): InputRule[];
  keys?(params: SchemaTypeParams<GType>): KeyboardBindings;

  /** Register a plugin for the extension */
  plugins?(params: SchemaTypeParams<GType>): ProsemirrorPlugin[];
}

export type AnyExtension = Extension<any, any>;
