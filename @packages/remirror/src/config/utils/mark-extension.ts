import { IMarkExtension, SchemaWithStateParams } from '../../types';
import { markActive } from './document-helpers';
import { Extension } from './extension';

export class MarkExtension extends Extension implements IMarkExtension {
  get type() {
    return 'mark' as 'mark';
  }

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
