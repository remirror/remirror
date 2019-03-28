import { Doc, ExtensionMapValue, Paragraph, Text } from '@remirror/core';
import { BaseKeymap, Composition, History, Placeholder } from './extensions';

export const baseExtensions: ExtensionMapValue[] = [
  { extension: new Doc(), priority: 1 },
  { extension: new Text(), priority: 1 },
  { extension: new Paragraph(), priority: 1 },
  { extension: new Composition(), priority: 3 },
  { extension: new History(), priority: 3 },
  { extension: new Placeholder(), priority: 3 },
  { extension: new BaseKeymap(), priority: 10 },
];
