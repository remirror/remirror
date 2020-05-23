import { NodeExtension, NodeGroup } from '@remirror/core';

/**
 * The default text passed into the prosemirror schema.
 *
 * @core
 */
export class TextExtension extends NodeExtension {
  public readonly name = 'text' as const;

  protected createNodeSpec() {
    return { group: NodeGroup.Inline };
  }
}
