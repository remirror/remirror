import { EditorSchema, isInstanceOf } from '@remirror/core';
import { TextSelection } from 'prosemirror-state';

// TODO implement
export class MulticursorSelection extends TextSelection<EditorSchema> {
  // private selections: TextSelection[] = [];
}

/**
 * Checks to see whether the selection is a multicursor selection
 *
 * @param val - the value to check
 */
export const isMulticursorSelection = isInstanceOf(MulticursorSelection);
