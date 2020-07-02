import { ExtensionPriority, NodeExtension, NodeGroup } from '@remirror/core';

/**
 * The default text passed into the prosemirror schema.
 *
 * Extra attributes are not allowed on the text extension.
 *
 * @core
 */
export class TextExtension extends NodeExtension {
  static readonly disableExtraAttributes = true;
  static readonly defaultPriority = ExtensionPriority.Medium;

  get name() {
    return 'text' as const;
  }

  createNodeSpec() {
    return { group: NodeGroup.Inline };
  }
}
