import { Attrs, NodeExtensionOptions } from '@remirror/core';

export interface ParagraphExtensionOptions extends NodeExtensionOptions {
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

export type IndentLevels = [number, number];

/**
 * The possible values for text alignment.
 */
export type TextAlignment = 'left' | 'right' | 'center' | 'justify';

export type ParagraphExtensionAttrs = Attrs<{
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
