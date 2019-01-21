import { InputRule } from 'prosemirror-inputrules';
import { PluginKey } from 'prosemirror-state';
import { Cast } from '../../helpers';
import {
  CommandFunction,
  ExtensionActiveFunction,
  ExtensionType,
  FlexibleConfig,
  IExtension,
  ProsemirrorPlugin,
  SchemaParams,
  SchemaWithStateParams,
} from '../../types';

export abstract class Extension<T extends {} = {}> implements IExtension {
  public readonly options: T;
  public readonly type: ExtensionType = ExtensionType.EXTENSION;
  public abstract readonly name: string;
  private pk?: PluginKey;

  constructor(...args: keyof T extends never ? [] : [T?]) {
    if (args[0]) {
      this.options = {
        ...this.defaultOptions,
        ...args[0],
      };
    } else {
      this.options = Cast<T>(this.defaultOptions);
    }
    this.init();
  }

  private init() {
    this.pk = new PluginKey(this.name);
  }

  public get pluginKey(): PluginKey {
    if (this.pk) {
      return this.pk;
    }
    this.pk = new PluginKey(this.name);
    return this.pk;
  }

  get defaultOptions(): Partial<T> {
    return {};
  }

  get plugins() {
    return [] as ProsemirrorPlugin[];
  }

  public inputRules(_: SchemaParams): InputRule[] {
    return [];
  }

  public keys(_: SchemaParams): Record<string, CommandFunction> {
    return {};
  }

  public pasteRules: IExtension['pasteRules'] = () => {
    return [];
  };

  public active(_: SchemaWithStateParams): FlexibleConfig<ExtensionActiveFunction> {
    return () => false;
  }

  public enabled(_: SchemaWithStateParams) {
    return () => true;
  }
}
