import { DocExtension, PrioritizedExtension, TextExtension } from '@remirror/core';
import {
  BaseKeymapExtension,
  CompositionExtension,
  DropCursorExtension,
  GapCursorExtension,
  HistoryExtension,
} from './extensions';
import { ParagraphExtension } from './nodes';

/**
 * Base extensions are automatically injected into the default RemirrorEditor.
 *
 * To override them, you can either add your own extension with the same extensionName
 * or you can turn off all of the base extensions.
 */
export const baseExtensions: PrioritizedExtension[] = [
  { extension: new DocExtension(), priority: 1 },
  { extension: new TextExtension(), priority: 1 },
  { extension: new ParagraphExtension(), priority: 1 },
  { extension: new CompositionExtension(), priority: 3 },
  { extension: new HistoryExtension(), priority: 3 },
  { extension: new GapCursorExtension(), priority: 10 },
  { extension: new DropCursorExtension(), priority: 10 },
  { extension: new BaseKeymapExtension(), priority: 10 },
];

/**
 * The BaseExtensions union type shows the extension provided by default in a remirror editor.
 * This union is useful for extending with your own types to provide better typechecking
 * throughout your codebase
 */
export type BaseExtensions =
  | DocExtension
  | TextExtension
  | ParagraphExtension
  | CompositionExtension
  | HistoryExtension
  | GapCursorExtension
  | DropCursorExtension
  | BaseKeymapExtension;
