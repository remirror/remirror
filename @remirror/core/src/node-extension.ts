import { NodeType } from 'prosemirror-model';
import { Extension, isExtension } from './extension';
import { isNodeActive } from './helpers/utils';
import {
  BooleanExtensionCheck,
  EditorSchema,
  ExtensionType,
  NodeExtensionOptions,
  NodeExtensionSpec,
  PlainObject,
  SchemaNodeTypeParams,
} from './types';

/**
 * Defines an abstract class for creating extensions which can place nodes into the prosemirror state.
 *
 * @remarks
 * For more information see {@link https://prosemirror.net/docs/ref/#model.Node}
 */
export abstract class NodeExtension<
  GOptions extends NodeExtensionOptions = NodeExtensionOptions,
  GCommands extends string = string,
  GExtensionData extends {} = PlainObject
> extends Extension<GOptions, GCommands, GExtensionData, NodeType<EditorSchema>> {
  /**
   * Identifies this extension as a **NODE** type from the prosemirror terminology.
   */
  get type(): ExtensionType.NODE {
    return ExtensionType.NODE;
  }

  /**
   * The prosemirror specification which sets up the node in the schema.
   *
   * The main difference between this and Prosemirror `NodeSpec` is that that the `toDOM` method doesn't
   * allow dom manipulation. You can only return an array or string.
   *
   * For more advanced configurations, where dom manipulation is required, it is advisable to set up a nodeView.
   */
  public abstract readonly schema: NodeExtensionSpec;

  public isActive({ getState, type }: SchemaNodeTypeParams): BooleanExtensionCheck<GCommands> {
    return ({ attrs }) => {
      return isNodeActive({ state: getState(), type, attrs });
    };
  }

  public isEnabled({  }: SchemaNodeTypeParams): BooleanExtensionCheck<GCommands> {
    return () => true;
  }
}

/**
 * Determines if the passed in extension is a node extension. Useful as a type guard where a particular type of extension is needed.
 *
 * @param extension - the extension to check
 */
export const isNodeExtension = (extension: unknown): extension is NodeExtension<any> =>
  isExtension(extension) && extension.type === ExtensionType.NODE;
