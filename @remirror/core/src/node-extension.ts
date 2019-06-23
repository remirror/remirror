import { NodeType } from 'prosemirror-model';
import { Extension, isExtension } from './extension';
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

  public active({ getState, type }: SchemaNodeTypeParams): FlexibleConfig<ExtensionBooleanFunction> {
    return attrs => {
      return nodeActive({ state: getState(), type, attrs });
    };
  }
}

/**
 * Determines if the passed in extension is a node extension. Useful as a type guard where a particular type of extension is needed.
 *
 * @param extension - the extension to check
 */
export const isNodeExtension = (extension: unknown): extension is NodeExtension<any> =>
  isExtension(extension) && extension instanceof NodeExtension;
