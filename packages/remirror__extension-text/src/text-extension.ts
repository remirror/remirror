import {
  extension,
  ExtensionPriority,
  ExtensionTag,
  NodeExtension,
  NodeExtensionSpec,
} from '@remirror/core';

/**
 * The default text passed into the prosemirror schema.
 *
 * Extra attributes are not allowed on the text extension.
 *
 * @core
 */
@extension({
  disableExtraAttributes: true,
  defaultPriority: ExtensionPriority.Medium,
})
export class TextExtension extends NodeExtension {
  get name() {
    return 'text' as const;
  }

  createTags() {
    return [ExtensionTag.InlineNode];
  }

  createNodeSpec(): NodeExtensionSpec {
    return {};
  }
}

declare global {
  namespace Remirror {
    interface AllExtensions {
      text: TextExtension;
    }
  }
}
