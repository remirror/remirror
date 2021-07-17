/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { EditorSchema, EditorView, FindProsemirrorNodeResult, ResolvedPos } from '@remirror/core';
import { Fragment, Node as ProsemirrorNode } from '@remirror/pm/model';
import { cellAround, CellSelection, TableMap } from '@remirror/pm/tables';

import { domCellAround } from '../table-column-resizing';
import { ReactTableNodeAttrs } from '../table-extensions';
import { setControllerPluginMeta } from '../table-plugins';
import { Events } from '../utils/jsx';
import { cellSelectionToSelection } from '../utils/prosemirror';
import { repeat } from './array';
import { CellAxis, FindTable } from './types';

export interface InjectControllersProps {
  schema: EditorSchema;
  getMap: () => TableMap;
  table: ProsemirrorNode;
}
export function injectControllers({
  schema,
  getMap,
  table: oldTable,
}: InjectControllersProps): ProsemirrorNode {
  const controllerCell = schema.nodes.tableControllerCell!.create();
  const headerControllerCells: ProsemirrorNode[] = repeat(controllerCell, getMap().width + 1);

  const controllerRow: ProsemirrorNode = schema.nodes.tableRow!.create({}, headerControllerCells);
  const newRowsArray: ProsemirrorNode[] = [controllerRow];

  const oldRows = oldTable.content;
  oldRows.forEach((oldRow) => {
    const oldCells = oldRow.content;
    const newCells = Fragment.from(controllerCell).append(oldCells);
    const newRow = oldRow.copy(newCells);
    newRowsArray.push(newRow);
  });

  const newRows = Fragment.fromArray(newRowsArray);
  const newTable = oldTable.copy(newRows);

  // Warning:
  // prosemirror-model will build up a single reusable default attribute
  // object, and use it for all nodes that don't specify specific
  // attributes for node types where all attrs have a default value. That
  // means we shouldn't directly update an attribute from a node's attrs.
  (newTable.attrs as ReactTableNodeAttrs) = {
    ...(newTable.attrs as ReactTableNodeAttrs),
    isControllersInjected: true,
  };

  return newTable;
}

export function createControllerEvents({
  view,
  findTable,
}: {
  view: EditorView;
  findTable: FindTable;
}): Events {
  return {
    onClick: (event) => {
      const axis = getCellAxisByMouseEvent(view, event);

      if (axis) {
        if (axis.row > 0) {
          selectRow(view, findTable, axis.row);
        } else if (axis.col > 0) {
          selectColumn(view, findTable, axis.col);
        } else {
          selectTable(view, findTable);
        }
      }
    },
    onMouseEnter: (event) => {
      const axis = getCellAxisByMouseEvent(view, event);

      if (axis) {
        if (axis.row > 0) {
          setPreselectRow(view, axis.row);
        } else if (axis.col > 0) {
          setPreselectColumn(view, axis.col);
        } else {
          setPreselectTable(view, true);
        }
      }
    },
    onMouseLeave: () => {
      resetControllerPluginMeta(view);
    },
  };
}

function onlyTableFound<Extra extends unknown[]>(
  func: (view: EditorView, table: FindProsemirrorNodeResult, ...extra: Extra) => void,
) {
  return (view: EditorView, findTable: FindTable, ...extra: Extra) => {
    const found = findTable();

    if (!found) {
      return;
    }

    return func(view, found, ...extra);
  };
}

const selectRow = onlyTableFound(
  (view: EditorView, table: FindProsemirrorNodeResult, index: number) => {
    const map = TableMap.get(table.node);
    const cellIndex = getCellIndex(map, index, 0);
    let tr = view.state.tr;
    const posInTable = map.map[cellIndex + 1]!;
    const pos = table.pos + posInTable + 1;
    const $pos = tr.doc.resolve(pos);
    const selection = CellSelection.rowSelection($pos);
    tr = tr.setSelection(cellSelectionToSelection(selection));
    view.dispatch(tr);
  },
);

const selectColumn = onlyTableFound(
  (view: EditorView, table: FindProsemirrorNodeResult, index: number) => {
    const map = TableMap.get(table.node);
    const cellIndex = getCellIndex(map, 0, index);
    let tr = view.state.tr;
    const posInTable = map.map[cellIndex]!;
    const pos = table.pos + posInTable + 1;
    const $pos = tr.doc.resolve(pos);
    const selection = CellSelection.colSelection($pos);
    tr = tr.setSelection(cellSelectionToSelection(selection));
    view.dispatch(tr);
  },
);

const selectTable = onlyTableFound((view, table) => {
  const map = TableMap.get(table.node);

  if (map.map.length > 0) {
    let tr = view.state.tr;
    const firstCellPosInTable = map.map[0]!;
    const lastCellPosInTable = map.map[map.map.length - 1]!;
    const firstCellPos = table.pos + firstCellPosInTable + 1;
    const lastCellPos = table.pos + lastCellPosInTable + 1;
    const $firstCellPos = tr.doc.resolve(firstCellPos);
    const $lastCellPos = tr.doc.resolve(lastCellPos);
    const selection = new CellSelection($firstCellPos, $lastCellPos);
    tr = tr.setSelection(cellSelectionToSelection(selection));
    view.dispatch(tr);
  }
});

function setPreselectRow(view: EditorView, index: number): void {
  view.dispatch(setControllerPluginMeta(view.state.tr, { preselectRow: index }));
}

function setPreselectColumn(view: EditorView, index: number): void {
  view.dispatch(setControllerPluginMeta(view.state.tr, { preselectColumn: index }));
}

function setPreselectTable(view: EditorView, value: boolean): void {
  view.dispatch(setControllerPluginMeta(view.state.tr, { preselectTable: value }));
}

export function setPredelete(view: EditorView, value: boolean): void {
  view.dispatch(setControllerPluginMeta(view.state.tr, { predelete: value }));
}

function resetControllerPluginMeta(view: EditorView): void {
  view.dispatch(
    setControllerPluginMeta(view.state.tr, {
      preselectRow: -1,
      preselectColumn: -1,
      preselectTable: false,
      predelete: false,
    }),
  );
}

function getCellIndex(map: TableMap, rowIndex: number, colIndex: number): number {
  return map.width * rowIndex + colIndex;
}

/**
 * @deprecated
 */
export function getCellAxisV1($cellPos: ResolvedPos): CellAxis {
  return { col: $cellPos.index(-1), row: $cellPos.index(-2) };
}

export function getCellAxisByMouseEvent(view: EditorView, event: MouseEvent): CellAxis | null {
  const domCell = domCellAround(event.target);

  if (!domCell) {
    return null;
  }

  const domCellRect = domCell.getBoundingClientRect();

  // we can't directly use the mouse event's clientX and clientY because when the mouse
  // is insert the trigger area, which it may or may not be insert the ccontroller cell.
  // we use "+ 1" to make sure that the corrds is inside the cell dom element.
  return getCellAxisByCoords(view, { left: domCellRect.left + 1, top: domCellRect.top + 1 });
}

export function getCellAxisByCoords(
  view: EditorView,
  coords: { left: number; top: number },
): CellAxis | null {
  const cellPos = view.posAtCoords(coords);

  if (!cellPos) {
    return null;
  }

  const $cell = cellAround(view.state.doc.resolve(cellPos.pos));

  if (!$cell) {
    return null;
  }

  const map = TableMap.get($cell.node(-1));
  const start = $cell.start(-1);
  const rect = map.findCell($cell.pos - start);
  const { left: col, top: row } = rect;

  return { col, row };
}

export enum CellSelectionType {
  row = 1,
  col = 2,
  table = 3,
  other = 4,
}

export function getCellSelectionType(selection: CellSelection): CellSelectionType {
  if (selection.isRowSelection()) {
    if (selection.isColSelection()) {
      return CellSelectionType.table;
    }

    return CellSelectionType.row;
  } else if (selection.isColSelection()) {
    return CellSelectionType.col;
  }

  return CellSelectionType.other;
}
