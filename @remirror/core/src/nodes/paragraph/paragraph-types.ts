import { FindParentNodeResult } from '../../helpers';
import { Attrs, NodeExtensionOptions } from '../../types';

/**
 * False when there is already a paragraph at the end of the document.
 *
 * The result of the find node when the node needs to be replaced.
 */
export type ShouldInsertParagraphAtEnd = false | FindParentNodeResult;

export interface ParagraphExtensionOptions extends NodeExtensionOptions {
  /**
   * Ensure that there's always a trailing paragraph at the end of the document.
   *
   * Why? In some scenarios it is difficult to place a cursor after the last element.
   * This ensures there's always space to select the position afterward.
   *
   * @default false
   */
  ensureTrailingParagraph?: boolean;

  /**
   * The attribute to use to store the value of the current indentation level.
   */
  indentAttribute?: string;

  /**
   * The levels of indentation supported - should be a tuple with the lowest value first and
   * the max indent last.
   *
   * @default [0,7]
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
  align?: TextAlignment;

  /**
   * The indentation number.
   */
  indent?: number;

  /**
   * The line spacing for the paragraph.
   */
  lineSpacing?: string;

  /**
   * The top padding for the paragraph.
   */
  paddingTop?: string;

  /**
   * The bottom padding for the paragraph.
   */
  paddingBottom?: string;

  /**
   * The element id (rarely used).
   */
  id?: string;
}>;
