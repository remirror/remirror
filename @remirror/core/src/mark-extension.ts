import { MarkType } from 'prosemirror-model';
import { Extension } from './extension';
import { markActive } from './helpers/document';
import {
  EditorSchema,
  ExtensionBooleanFunction,
  ExtensionManagerParams,
  ExtensionType,
  FlexibleConfig,
  MarkExtensionOptions,
  MarkExtensionSpec,
} from './types';

export abstract class MarkExtension<
  GOptions extends MarkExtensionOptions = MarkExtensionOptions
> extends Extension<GOptions, MarkType<EditorSchema>> {
  get type(): ExtensionType.MARK {
    return ExtensionType.MARK;
  }

  public abstract readonly schema: MarkExtensionSpec;

  public active({
    getEditorState,
    schema,
  }: ExtensionManagerParams): FlexibleConfig<ExtensionBooleanFunction> {
    return () => markActive(getEditorState(), schema.marks[this.name]);
  }
}

export interface MarkExtensionConstructor<GOptions extends {}, GExtension extends MarkExtension<GOptions>> {
  // tslint:disable-next-line: callable-types
  new (options?: GOptions): GExtension;
}
