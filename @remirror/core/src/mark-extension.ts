import { MarkType } from 'prosemirror-model';
import { markActive } from './document-helpers';
import { Extension } from './extension';
import { EditorSchema, ExtensionType, SchemaWithStateParams } from './types';

export abstract class MarkExtension<GOptions extends {} = {}> extends Extension<
  GOptions,
  MarkType<EditorSchema>
> {
  get type() {
    return ExtensionType.MARK;
  }

  get view() {
    return null;
  }

  get schema() {
    return {};
  }

  public active({ getEditorState, schema }: SchemaWithStateParams) {
    return () => markActive(getEditorState(), schema.marks[this.name]);
  }
}
