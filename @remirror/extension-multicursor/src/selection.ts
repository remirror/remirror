import { EditorSchema, isSelection } from '@remirror/core';
import { TextSelection } from 'prosemirror-state';

export class MulticursorSelection extends TextSelection<EditorSchema> {
  // private selections: TextSelection[] = [];
}

/**
 * Checks to see whether the selection is a multicursor selection
 *
 * @param val - the value to check
 */
export const isMulticursorSelection = (val: unknown): val is MulticursorSelection =>
  isSelection(val) && val instanceof MulticursorSelection;
