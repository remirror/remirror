import { NodeType } from 'prosemirror-model';
import { Extension } from './extension';
import { nodeActive } from './helpers/utils';
import {
  EditorSchema,
  ExtensionBooleanFunction,
  ExtensionManagerParams,
  ExtensionType,
  FlexibleConfig,
  NodeExtensionOptions,
  NodeExtensionSpec,
} from './types';

export abstract class NodeExtension<
  GOptions extends NodeExtensionOptions = NodeExtensionOptions
> extends Extension<GOptions, NodeType<EditorSchema>> {
  get type(): ExtensionType.NODE {
    return ExtensionType.NODE;
  }

  public abstract readonly schema: NodeExtensionSpec;

  public active({
    getEditorState,
    schema,
  }: ExtensionManagerParams): FlexibleConfig<ExtensionBooleanFunction> {
    return attrs => {
      return nodeActive(getEditorState(), schema.nodes[this.name], attrs);
    };
  }
}

export interface NodeExtensionConstructor<
  GOptions extends NodeExtensionOptions,
  GExtension extends NodeExtension<GOptions>
> {
  // tslint:disable-next-line: callable-types
  new (options?: GOptions): GExtension;
}
