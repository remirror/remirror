import { ExtensionType } from '@remirror/core-constants';
import {
  CommandStatusCheck,
  EditorSchema,
  ExtensionManagerNodeTypeParams,
  NodeExtensionOptions,
  NodeExtensionSpec,
  NodeType,
} from '@remirror/core-types';
import { isNodeActive } from '@remirror/core-utils';
import { Extension } from './extension';

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
  get type(): ExtensionType.Node {
    return ExtensionType.Node;
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

  public isActive({ getState, type }: ExtensionManagerNodeTypeParams): CommandStatusCheck {
    return ({ attrs }) => {
      return isNodeActive({ state: getState(), type, attrs });
    };
  }

  public isEnabled(_: ExtensionManagerNodeTypeParams): CommandStatusCheck {
    return () => true;
  }
}
