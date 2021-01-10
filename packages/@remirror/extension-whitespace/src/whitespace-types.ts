import { FromToProps, ProsemirrorNode, Static } from '@remirror/core';
import { DecorationSet } from '@remirror/pm/view';

export interface WhitespaceOptions extends WhitespaceDecoratorSettings {
  /**
   * The initial whitespace visibility.
   *
   * @default false
   */
  initialVisibility?: Static<boolean>;

  /**
   * The list of default decorators that are used.
   */
  decorators?: Array<DefaultDecorator | WhitespaceDecorator>;
}

/**
 * The built in whitespace decorations.
 */
export type DefaultDecorator = 'hardBreak' | 'paragraph' | 'space';

export interface WhitespaceDecoratorSettings {
  /**
   * The nodes that are interpreted as break nodes.
   *
   * @default ['hardBreak']
   */
  breakNodes?: string[];

  /**
   * The nodes that are interpreted as paragraph nodes.
   *
   * @default ['paragraph']
   */
  paragraphNodes?: string[];

  /**
   * The text which should be interpreted as space characters.
   *
   * @default [' ']
   */
  spaceCharacters?: string[];
}

/**
 * The whitespace decorator function
 */
export type WhitespaceDecorator = (details: WhitespaceRange) => DecorationSet;

export interface WhitespaceRange extends FromToProps {
  doc: ProsemirrorNode;
  decorationSet: DecorationSet;
}
