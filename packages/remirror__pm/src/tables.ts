import { CellSelection } from 'prosemirror-tables';

import { EditorSchema } from './extra/pm-types';

/**
 * Predicate checking whether the selection is a [[`CellSelection`]].
 *
 * @param value - the value to check
 */
export function isCellSelection(value: unknown): value is CellSelection<EditorSchema> {
  return typeof value === 'object' && value instanceof CellSelection;
}

export * from 'prosemirror-tables';
