import { INodeExtension } from '../../types';
import { nodeActive } from './document-helpers';
import { Extension } from './extension';

export class NodeExtension<T extends {} = {}> extends Extension<T> implements INodeExtension {
  get type() {
    return 'node' as 'node';
  }

  get view() {
    return undefined;
  }

  get schema() {
    return {};
  }

  public active: INodeExtension['active'] = ({ getEditorState, schema }) => attrs =>
    nodeActive(schema.nodes.name, attrs, getEditorState());
}
