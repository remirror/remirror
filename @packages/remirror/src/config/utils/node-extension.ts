import {
  ExtensionActiveFunction,
  ExtensionType,
  FlexibleConfig,
  INodeExtension,
  SchemaWithStateParams,
} from '../../types';
import { nodeActive } from './document-helpers';
import { Extension } from './extension';

export abstract class NodeExtension<T extends {} = {}> extends Extension<T>
  implements INodeExtension {
  public readonly type = ExtensionType.NODE;

  get view() {
    return undefined;
  }

  get schema() {
    return {};
  }

  public active({
    getEditorState,
    schema,
  }: SchemaWithStateParams): FlexibleConfig<ExtensionActiveFunction> {
    return attrs => nodeActive(schema.nodes.name, attrs, getEditorState());
  }
}
