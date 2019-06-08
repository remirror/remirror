import { NodeType } from 'prosemirror-model';
import { Extension } from './extension';
import { nodeActive } from './helpers/utils';
import {
  EditorSchema,
  ExtensionBooleanFunction,
  ExtensionType,
  FlexibleConfig,
  NodeExtensionOptions,
  NodeExtensionSpec,
  SchemaNodeTypeParams,
} from './types';

/**
 * Defines an abstract class for creating extensions which can place nodes into the prosemirror state.
 *
 * @remarks
 * For more information see {@link https://prosemirror.net/docs/ref/#model.Node}
 */
export abstract class NodeExtension<
  GOptions extends NodeExtensionOptions = NodeExtensionOptions
> extends Extension<GOptions, NodeType<EditorSchema>> {
  /**
   * Identifies this extension as a **NODE** type from the prosemirror terminology.
   */
  get type(): ExtensionType.NODE {
    return ExtensionType.NODE;
  }

  /**
   * Define the schema for the prosemirror node.
   */
  public abstract readonly schema: NodeExtensionSpec;

  public active({ getEditorState, type }: SchemaNodeTypeParams): FlexibleConfig<ExtensionBooleanFunction> {
    return attrs => {
      return nodeActive({ state: getEditorState(), type, attrs });
    };
  }
}
