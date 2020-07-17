import {
  ApplySchemaAttributes,
  convertCommand,
  DefaultExtensionOptions,
  ExtensionPriority,
  ExtensionTag,
  INDENT_ATTRIBUTE,
  INDENT_LEVELS,
  IndentLevels,
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
export class ParagraphExtension extends NodeExtension<ParagraphOptions> {
  static readonly defaultOptions: DefaultExtensionOptions<ParagraphOptions> = {
    indentAttribute: INDENT_ATTRIBUTE,
    indentLevels: INDENT_LEVELS,
  };

  static readonly defaultPriority = ExtensionPriority.Medium;

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
  createCommands = () => {
    return {
      createParagraph: (attributes: ParagraphExtensionAttributes) => {
        return convertCommand(setBlockType(this.type, attributes));
      },
    };
  };
}

export interface ParagraphOptions {
  /**
   * The attribute to use to store the value of the current indentation level.
   */
  indentAttribute?: string;

  /**
   * The levels of indentation supported - should be a tuple with the lowest value first and
   * the max indent last.
   *
   * @defaultValue `[0,7]`
   */
  indentLevels?: IndentLevels;
}

/**
 * The possible values for text alignment.
 */
export type TextAlignment = 'left' | 'right' | 'center' | 'justify';

export type ParagraphExtensionAttributes = ProsemirrorAttributes<{
  /**
   * The alignment of the text
   */
  align?: TextAlignment | null;

  /**
   * The indentation number.
   */
  indent?: number | null;

  /**
   * The line spacing for the paragraph.
   */
  lineSpacing?: string | null;

  /**
   * The element id (rarely used).
   */
  id?: string | null;
}>;
