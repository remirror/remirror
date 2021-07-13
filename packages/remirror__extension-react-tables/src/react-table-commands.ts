/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { DispatchFunction, EditorState, ProsemirrorNode } from '@remirror/core';
import { Transaction } from '@remirror/pm/state';
import { addColSpan, isInTable, selectedRect, TableMap, tableNodeTypes } from '@remirror/pm/tables';

import { setAttr } from './table-column-resizing';

/**
 * Add a column at the given position in a table.
 *
 * Taken from https://github.com/ProseMirror/prosemirror-tables/blob/v1.1.1/src/commands.js#L39
 * Use the next column instead of the previous column as the reference, so that the controller
 * cell will not be duplicated.
 */
export function addColumn(
  tr: Transaction,
  { map, tableStart, table }: { map: TableMap; tableStart: number; table: ProsemirrorNode },
  col: number,
): Transaction {
  const refColumn: number = col < map.width - 1 ? 0 : -1;

  for (let row = 0; row < map.height; row++) {
    const index = row * map.width + col;

    // If this position falls inside a col-spanning cell
    if (col > 0 && col < map.width && map.map[index - 1] === map.map[index]) {
      const pos = map.map[index]!;
      const cell = table.nodeAt(pos)!;
      tr.setNodeMarkup(
        tr.mapping.map(tableStart + pos),
        undefined,
        addColSpan(cell.attrs, col - map.colCount(pos)),
      );
      // Skip ahead if rowspan > 1
      row += cell.attrs.rowspan - 1;
    } else {
      const type = table.nodeAt(map.map[index + refColumn]!)!.type;
      const pos = map.positionAt(row, col, table);
      tr.insert(tr.mapping.map(tableStart + pos), type.createAndFill()!);
    }
  }

  return tr;
}

/**
 * Command to add a column before the column with the selection.
 */
export function addColumnBefore(
  state: EditorState,
  dispatch: DispatchFunction | undefined,
): boolean {
  if (!isInTable(state)) {
    return false;
  }

  if (dispatch) {
    const rect = selectedRect(state);
    dispatch(addColumn(state.tr, rect, rect.left));
  }

  return true;
}

/**
 * Command to add a column after the column with the selection.
 */
export function addColumnAfter(
  state: EditorState,
  dispatch: DispatchFunction | undefined,
): boolean {
  if (!isInTable(state)) {
    return false;
  }

  if (dispatch) {
    const rect = selectedRect(state);
    dispatch(addColumn(state.tr, rect, rect.right));
  }

  return true;
}

/**
 * Add a row at the given position in a table.
 *
 * Taken from https://github.com/ProseMirror/prosemirror-tables/blob/v1.1.1/src/commands.js#L127
 * Use the next row instead of the previous row as the reference, so that the controller
 * cell will not be duplicated.
 */
export function addRow(
  tr: Transaction,
  { map, tableStart, table }: { map: TableMap; tableStart: number; table: ProsemirrorNode },
  row: number,
): Transaction {
  let rowPos = tableStart;

  for (let i = 0; i < row; i++) {
    rowPos += table.child(i).nodeSize;
  }

  const refRow: number = row < map.height - 1 ? 0 : -1;
  const cells: ProsemirrorNode[] = [];

  for (let col = 0, index = map.width * row; col < map.width; col++, index++) {
    // Covered by a rowspan cell
    if (row > 0 && row < map.height && map.map[index] === map.map[index - map.width]) {
      const pos = map.map[index]!;
      const attrs = table.nodeAt(pos)!.attrs;
      tr.setNodeMarkup(tableStart + pos, undefined, setAttr(attrs, 'rowspan', attrs.rowspan + 1));
      col += attrs.colspan - 1;
    } else {
      const type = table.nodeAt(map.map[index + refRow * map.width]!)!.type;
      cells.push(type.createAndFill()!);
    }
  }

  tr.insert(rowPos, tableNodeTypes(table.type.schema).row.create(null, cells));
  return tr;
}

/**
 * Add a table row before the selection.
 */
export function addRowBefore(state: EditorState, dispatch: DispatchFunction | undefined): boolean {
  if (!isInTable(state)) {
    return false;
  }

  if (dispatch) {
    const rect = selectedRect(state);
    dispatch(addRow(state.tr, rect, rect.top));
  }

  return true;
}

/**
 * Add a table row after the selection.
 */
export function addRowAfter(state: EditorState, dispatch: DispatchFunction | undefined): boolean {
  if (!isInTable(state)) {
    return false;
  }

  if (dispatch) {
    const rect = selectedRect(state);
    dispatch(addRow(state.tr, rect, rect.bottom));
  }

  return true;
}
