import { ExtensionType, IMarkExtension, SchemaWithStateParams } from '../../types';
import { markActive } from './document-helpers';
import { Extension } from './extension';

export abstract class MarkExtension extends Extension implements IMarkExtension {
  public readonly type = ExtensionType.MARK;

  get view() {
    return null;
  }

  get schema() {
    return {};
  }

  public active({ getEditorState, schema }: SchemaWithStateParams) {
    return () => markActive(schema.marks[this.name], getEditorState());
  }
}
