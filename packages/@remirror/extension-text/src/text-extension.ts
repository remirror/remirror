import { extensionDecorator, ExtensionPriority, ExtensionTag, NodeExtension } from '@remirror/core';

/**
 * The default text passed into the prosemirror schema.
 *
 * Extra attributes are not allowed on the text extension.
 *
 * @core
 */
@extensionDecorator({
  disableExtraAttributes: true,
  defaultPriority: ExtensionPriority.Medium,
})
export class TextExtension extends NodeExtension {
  get name() {
    return 'text' as const;
  }

  readonly tags = [ExtensionTag.InlineNode];

  createNodeSpec() {
    return {};
  }
}
