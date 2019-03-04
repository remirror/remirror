import { Doc, Paragraph, Text } from '@remirror/core';
import {
  Blockquote,
  Bold,
  Bullet,
  Code,
  CodeBlock,
  HardBreak,
  Heading,
  Image,
  Italic,
  ListItem,
  OrderedList,
  Strike,
  Underline,
} from '@remirror/core-extensions';
/** All the required and core extensions for testing */
export declare const baseExtensions: Array<
  | Doc
  | Text
  | Paragraph
  | Bold
  | Italic
  | CodeBlock
  | Underline
  | Strike
  | Code<never>
  | Heading
  | Image
  | Bullet
  | Blockquote
  | HardBreak
  | ListItem
  | OrderedList
>;
export declare const testSchema: import('prosemirror-model').Schema<string, string>;
// # sourceMappingURL=test-schema.d.ts.map
