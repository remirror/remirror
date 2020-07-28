import {
  ApplySchemaAttributes,
  convertCommand,
  extensionDecorator,
  ExtensionPriority,
  ExtensionTag,
  NodeExtension,
  NodeExtensionSpec,
  NodeGroup,
  ProsemirrorAttributes,
} from '@remirror/core';
import { setBlockType } from '@remirror/pm/commands';

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

  readonly extensionTags = [ExtensionTag.LastNodeCompatible] as const;

  createNodeSpec(extra: ApplySchemaAttributes): NodeExtensionSpec {
    return {
      content: 'inline*',
      group: NodeGroup.Block,
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
      createParagraph: (attributes: ProsemirrorAttributes) => {
        return convertCommand(setBlockType(this.type, attributes));
      },
    };
  }
}

/**
 * The possible values for text alignment.
 */
