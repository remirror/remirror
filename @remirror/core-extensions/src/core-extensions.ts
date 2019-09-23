import { DocExtension, InferFlexibleExtensionList, TextExtension } from '@remirror/core';
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
export const baseExtensions = [
  { extension: new DocExtension(), priority: 1 },
  { extension: new TextExtension(), priority: 1 },
  { extension: new ParagraphExtension(), priority: 2 },
  { extension: new HistoryExtension(), priority: 3 },
  { extension: new CompositionExtension(), priority: 4 },
  { extension: new GapCursorExtension(), priority: 10 },
  { extension: new DropCursorExtension(), priority: 11 },
  { extension: new BaseKeymapExtension(), priority: 12 },
];

/**
 * The BaseExtensions union type shows the extension types available as base extensions.
 *
 * This union type is useful when paired with your own types to provide better typechecking
 * throughout your codebase.
 */
export type BaseExtensions = InferFlexibleExtensionList<typeof baseExtensions>;
