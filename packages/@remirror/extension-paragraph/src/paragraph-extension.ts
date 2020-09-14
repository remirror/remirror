import {
  ApplySchemaAttributes,
  CommandFunction,
  extensionDecorator,
  ExtensionPriority,
  ExtensionTag,
  NodeExtension,
  NodeExtensionSpec,
  ProsemirrorAttributes,
  setBlockType,
} from '@remirror/core';

/**
 * The paragraph is one of the essential building blocks for a prosemirror
 * editor and by default it is provided to all editors.
 *
 * @core
 */
@extensionDecorator({
  defaultPriority: ExtensionPriority.Medium,
})
export class ParagraphExtension extends NodeExtension {
  get name() {
    return 'paragraph' as const;
  }

  readonly tags = [ExtensionTag.LastNodeCompatible, ExtensionTag.BlockNode];

  createNodeSpec(extra: ApplySchemaAttributes): NodeExtensionSpec {
    return {
      content: 'inline*',
      attrs: {
        ...extra.defaults(),
      },
      draggable: false,
      parseDOM: [
        {
          tag: 'p',
          getAttrs: (node) => ({
            ...extra.parse(node),
          }),
        },
      ],

      toDOM: (node) => {
        return ['p', extra.dom(node), 0];
      },
    };
  }

  /**
   * Provides the commands that this extension uses.
   */
  createCommands() {
    return {
      createParagraph: (attributes: ProsemirrorAttributes): CommandFunction => {
        return setBlockType(this.type, attributes);
      },
    };
  }
}

declare global {
  namespace Remirror {
    interface AllExtensions {
      paragraph: ParagraphExtension;
    }
  }
}
