import { InputRule } from 'prosemirror-inputrules';
import { Cast } from '../../helpers';
import { IExtension, ProsemirrorPlugin, SchemaParams, SchemaWithStateParams } from '../../types';

export class Extension<T extends {} = {}> implements IExtension {
  public readonly options: T;

  constructor(...args: keyof T extends never ? [] : [T]) {
    if (args[0]) {
      this.options = {
        ...this.defaultOptions,
        ...args[0],
      };
    } else {
      this.options = Cast(this.defaultOptions);
    }
  }

  get name() {
    return '';
  }

  get type() {
    return 'extension';
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

  public keys: IExtension['keys'] = () => {
    return {};
  };

  public pasteRules: IExtension['pasteRules'] = () => {
    return [];
  };

  public active(_: SchemaWithStateParams) {
    return () => false;
  }

  public enabled(_: SchemaWithStateParams) {
    return () => true;
  }
}
