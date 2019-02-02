import { nodeActive } from './document-helpers';
import { Extension } from './extension';
import {
  ExtensionBooleanFunction,
  ExtensionType,
  FlexibleConfig,
  INodeExtension,
  SchemaWithStateParams,
} from './types';

export abstract class NodeExtension<GOptions extends {} = {}> extends Extension<GOptions>
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
  }: SchemaWithStateParams): FlexibleConfig<ExtensionBooleanFunction> {
    return attrs => nodeActive(getEditorState(), schema.nodes.name, attrs);
  }
}
