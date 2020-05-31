import { NodeExtension, NodeGroup } from '@remirror/core';

/**
 * The default text passed into the prosemirror schema.
 *
 * @core
 */
export class TextExtension extends NodeExtension {
  public static readonly disableExtraAttributes = true;

  get name() {
    return 'text' as const;
  }

  public createNodeSpec() {
    return { group: NodeGroup.Inline };
  }
}
