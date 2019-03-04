import { Cast, Doc, ExtensionManager, Paragraph, Text } from '@remirror/core';
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
export const baseExtensions = [
  new Doc(),
  new Text(),
  new Paragraph(),
  new Bold(),
  new Italic(),
  new CodeBlock(),
  new Underline(),
  new Strike(),
  new Code(),
  new Heading(),
  new Image(),
  new Bullet(),
  new Blockquote(),
  new HardBreak(),
  new ListItem(),
  new OrderedList(),
];

const extensionManager = new ExtensionManager(baseExtensions, () => Cast({}), () => Cast({}));

export const testSchema = extensionManager.createSchema();
