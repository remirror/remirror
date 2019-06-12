import { DocExtension, ParagraphExtension, PrioritizedExtension, TextExtension } from '@remirror/core';
import { BaseKeymapExtension, CompositionExtension, HistoryExtension } from './extensions';

export const baseExtensions: PrioritizedExtension[] = [
  { extension: new DocExtension(), priority: 1 },
  { extension: new TextExtension(), priority: 1 },
  { extension: new ParagraphExtension(), priority: 1 },
  { extension: new CompositionExtension(), priority: 3 },
  { extension: new HistoryExtension(), priority: 3 },
  { extension: new BaseKeymapExtension(), priority: 10 },
];
