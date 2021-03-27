import {
  ApplySchemaAttributes,
  command,
  CommandFunction,
  extension,
  ExtensionPriority,
  ExtensionTag,
  keyBinding,
  KeyBindingProps,
  NamedShortcut,
  NodeExtension,
  NodeExtensionSpec,
  NodeSpecOverride,
  PrimitiveSelection,
  ProsemirrorAttributes,
} from '@remirror/core';
import { ExtensionParagraphMessages } from '@remirror/messages';

const insertParagraphOptions: Remirror.CommandDecoratorOptions = {
  icon: 'paragraph',
  label: ({ t }) => t(ExtensionParagraphMessages.INSERT_LABEL),
  description: ({ t }) => t(ExtensionParagraphMessages.INSERT_DESCRIPTION),
};

const convertParagraphOptions: Remirror.CommandDecoratorOptions = {
  icon: 'paragraph',
  label: ({ t }) => t(ExtensionParagraphMessages.CONVERT_LABEL),
  description: ({ t }) => t(ExtensionParagraphMessages.CONVERT_DESCRIPTION),
};

/**
 * The paragraph is one of the essential building blocks for a prosemirror
 * editor and by default it is provided to all editors.
 *
 * @core
 */
@extension({
  defaultPriority: ExtensionPriority.Medium,
})
export class ParagraphExtension extends NodeExtension {
  get name() {
    return 'paragraph' as const;
  }

  createTags() {
    return [
      ExtensionTag.LastNodeCompatible,
      ExtensionTag.TextBlock,
      ExtensionTag.Block,
      ExtensionTag.FormattingNode,
    ];
  }

  createNodeSpec(extra: ApplySchemaAttributes, override: NodeSpecOverride): NodeExtensionSpec {
    return {
      content: 'inline*',
      draggable: false,
      ...override,
      attrs: {
        ...extra.defaults(),
      },
      parseDOM: [
        {
          tag: 'p',
          getAttrs: (node) => ({
            ...extra.parse(node),
          }),
        },
        ...(override.parseDOM ?? []),
      ],

      toDOM: (node) => {
        return ['p', extra.dom(node), 0];
      },
    };
  }

  /**
   * Convert the current node to a paragraph.
   */
  @command(convertParagraphOptions)
  convertParagraph(options: ParagraphCommandOptions = {}): CommandFunction {
    const { attrs, selection, preserveAttrs } = options;

    return this.store.commands.setBlockNodeType.original(
      this.type,
      attrs,
      selection,
      preserveAttrs,
    );
  }

  /**
   * Inserts a paragraph into the editor at the current selection.
   */
  @command(insertParagraphOptions)
  insertParagraph(content: string, options: ParagraphCommandOptions = {}): CommandFunction {
    const { selection, attrs } = options;
    return this.store.commands.insertNode.original(this.type, { content, selection, attrs });
  }

  /**
   * Add the paragraph shortcut to the editor. This makes a paragraph into a
   */
  @keyBinding({ shortcut: NamedShortcut.Paragraph, command: 'convertParagraph' })
  shortcut(props: KeyBindingProps): boolean {
    return this.convertParagraph()(props);
  }
}

interface ParagraphCommandOptions {
  attrs?: ProsemirrorAttributes;
  selection?: PrimitiveSelection;
  preserveAttrs?: boolean;
}

declare global {
  namespace Remirror {
    interface AllExtensions {
      paragraph: ParagraphExtension;
    }
  }
}
