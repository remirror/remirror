import { NodeType } from 'prosemirror-model';
import { nodeActive } from './document-helpers';
import { Extension } from './extension';
import {
  EditorSchema,
  ExtensionBooleanFunction,
  ExtensionType,
  FlexibleConfig,
  NodeExtensionSpec,
  SchemaWithStateParams,
} from './types';

export abstract class NodeExtension<GOptions extends {} = {}> extends Extension<
  GOptions,
  NodeType<EditorSchema>
> {
  get type() {
    return ExtensionType.NODE;
  }

  public abstract readonly schema: NodeExtensionSpec;

  public active({ getEditorState, schema }: SchemaWithStateParams): FlexibleConfig<ExtensionBooleanFunction> {
    return attrs => nodeActive(getEditorState(), schema.nodes.name, attrs);
  }
}
