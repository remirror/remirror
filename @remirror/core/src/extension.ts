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
  public readonly options: GOptions;

  public abstract readonly name: string;
  private pk?: PluginKey;

  constructor(...args: keyof GOptions extends never ? [] : [GOptions?]) {
    if (args[0]) {
      this.options = {
        ...this.defaultOptions,
        ...args[0],
      };
    } else {
      this.options = Cast<GOptions>(this.defaultOptions);
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

  get plugins() {
    return [] as ProsemirrorPlugin[];
  }
}

export interface Extension<GOptions extends {} = {}, GType = never> {
  active?(params: SchemaWithStateParams): FlexibleConfig<ExtensionBooleanFunction>;
  enabled?(params: SchemaWithStateParams): FlexibleConfig<ExtensionBooleanFunction>;
  commands?(params: SchemaTypeParams<GType>): FlexibleConfig<ExtensionCommandFunction>;
  pasteRules?(params: SchemaTypeParams<GType>): ProsemirrorPlugin[];
  inputRules?(params: SchemaTypeParams<GType>): InputRule[];
  keys?(params: SchemaTypeParams<GType>): KeyboardBindings;
}

export type AnyExtension = Extension<any, any>;
