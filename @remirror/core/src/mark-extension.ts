import { MarkType } from 'prosemirror-model';
import { Extension } from './extension';
import { markActive } from './helpers/document';
import { EditorSchema, ExtensionType, MarkExtensionSpec, SchemaParams } from './types';

export abstract class MarkExtension<GOptions extends {} = {}> extends Extension<
  GOptions,
  MarkType<EditorSchema>
> {
  get type() {
    return ExtensionType.MARK;
  }

  public abstract readonly schema: MarkExtensionSpec;

  public active({ getEditorState, schema }: SchemaParams) {
    return () => markActive(getEditorState(), schema.marks[this.name]);
  }
}
