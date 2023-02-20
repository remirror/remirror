import {
  FindProsemirrorNodeResult,
  isElementDomNode,
  mergeDOMRects,
  NodeWithPosition,
  ProsemirrorNode,
  Selection,
} from '@remirror/core';
import {
  defaultAbsolutePosition,
  hasStateChanged,
  isPositionVisible,
  Positioner,
} from '@remirror/extension-positioner';
import { CellSelection, isCellSelection, TableMap } from '@remirror/pm/tables';

import { findCellClosestToPos, findTable } from './table-utils';

function getCellsInColumn(
  selection: Selection,
  columnIndex: number,
): NodeWithPosition[] | undefined {
  const table = findTable(selection);

  if (!table) {
    return;
  }

  const map = TableMap.get(table.node);

  if (columnIndex > 0 || columnIndex > map.width - 1) {
    return;
  }

  const cells = map.cellsInRect({
    left: columnIndex,
    right: columnIndex + 1,
    top: 0,
    bottom: map.height,
  });

  const columnNodes: NodeWithPosition[] = [];
  cells.forEach((nodePos) => {
    columnNodes.push({
      node: table.node.nodeAt(nodePos) as ProsemirrorNode,
      pos: table.start + nodePos,
    });
  });

  return columnNodes;
}

function getCellsInRow(selection: Selection, rowIndex: number): NodeWithPosition[] | undefined {
  const table = findTable(selection);

  if (!table) {
    return;
  }

  const map = TableMap.get(table.node);

  if (rowIndex > 0 || rowIndex > map.width - 1) {
    return;
  }

  const cells = map.cellsInRect({
    left: 0,
    right: map.width,
    top: rowIndex,
    bottom: rowIndex + 1,
  });

  const columnNodes: NodeWithPosition[] = [];
  cells.forEach((nodePos) => {
    columnNodes.push({
      node: table.node.nodeAt(nodePos) as ProsemirrorNode,
      pos: table.start + nodePos,
    });
  });

  return columnNodes;
}

/**
 * Creates a positioner for the current table node.
 *
 * It spans the full width and height of the table.
 */
export const tablePositioner = Positioner.create<FindProsemirrorNodeResult>({
  hasChanged: hasStateChanged,

  getActive(props) {
    const { selection } = props.state;
    const table = findTable(selection);

    if (!table) {
      return Positioner.EMPTY;
    }

    return [table];
  },

  getPosition(props) {
    const { view, data: table } = props;

    const node = view.nodeDOM(table.pos);

    if (!isElementDomNode(node)) {
      // This should never happen.
      return defaultAbsolutePosition;
    }

    const rect = node.getBoundingClientRect();
    const editorRect = view.dom.getBoundingClientRect();

    // The width and height of the current selected block node.
    const height = rect.height;
    const width = rect.width;

    // The top and left relative to the parent `editorRect`.
    const left = view.dom.scrollLeft + rect.left - editorRect.left - 1;
    const top = view.dom.scrollTop + rect.top - editorRect.top - 1;

    return {
      x: left,
      y: top,
      height,
      width,
      rect,
      visible: isPositionVisible(rect, view.dom),
    };
  },
});

/**
 * Creates a positioner for the current cell node.
 *
 * It spans the full width and height of the cell.
 */
export const activeCellPositioner = tablePositioner.clone(() => ({
  getActive(props) {
    const { selection } = props.state;
    const cell = findCellClosestToPos(selection);

    if (!cell) {
      return Positioner.EMPTY;
    }

    return [cell];
  },
}));

/**
 * Creates a positioner for top of each column in a table
 *
 * It returns multiple positions, for the top side of each column in a table
 */
export const allColumnsStartPositioner = Positioner.create<NodeWithPosition>({
  hasChanged: hasStateChanged,

  getActive(props) {
    const { selection } = props.state;

    const table = findTable(selection);

    if (!table) {
      return Positioner.EMPTY;
    }

    // Use the first ROW of the cells to obtain all columns
    const cells = getCellsInRow(selection, 0) ?? [];

    if (cells.length === 0) {
      return Positioner.EMPTY;
    }

    return cells;
  },

  getID(data) {
    return `${data.pos}`;
  },

  getPosition(props) {
    const { view, data: cell } = props;
    const node = view.nodeDOM(cell.pos);

    if (!isElementDomNode(node)) {
      // This should never happen.
      return defaultAbsolutePosition;
    }

    const rect = node.getBoundingClientRect();
    const editorRect = view.dom.getBoundingClientRect();

    const width = rect.width;

    // The top and left relative to the parent `editorRect`.
    const left = view.dom.scrollLeft + rect.left - editorRect.left - 1;
    const top = view.dom.scrollTop + rect.top - editorRect.top - 1;

    const columnTopRect = new DOMRect(rect.x - 1, rect.y - 1, width, 1);

    return {
      x: left,
      y: top,
      width,
      height: 1,
      rect: columnTopRect,
      visible: isPositionVisible(columnTopRect, view.dom),
    };
  },
});

/**
 * Creates a positioner for left of each row in a table
 *
 * It returns multiple positions, for the left side of each row in a table
 */
export const allRowsStartPositioner = allColumnsStartPositioner.clone(() => ({
  /**
   * This is only active for empty top level nodes. The data is the cursor start
   * and end position.
   */
  getActive(props) {
    const { selection } = props.state;

    const table = findTable(selection);

    if (!table) {
      return Positioner.EMPTY;
    }

    // Use the first COLUMN of the cells to obtain all rows
    const cells = getCellsInColumn(selection, 0) ?? [];

    if (cells.length === 0) {
      return Positioner.EMPTY;
    }

    return cells;
  },

  getPosition(props) {
    const { view, data: cell } = props;
    const node = view.nodeDOM(cell.pos);

    if (!isElementDomNode(node)) {
      // This should never happen.
      return defaultAbsolutePosition;
    }

    const rect = node.getBoundingClientRect();
    const editorRect = view.dom.getBoundingClientRect();

    const height = rect.height;

    // The top and left relative to the parent `editorRect`.
    const left = view.dom.scrollLeft + rect.left - editorRect.left - 1;
    const top = view.dom.scrollTop + rect.top - editorRect.top - 1;

    const rowLeftRect = new DOMRect(rect.x - 1, rect.y - 1, 1, height);

    return {
      x: left,
      y: top,
      width: 1,
      height,
      rect: rowLeftRect,
      visible: isPositionVisible(rowLeftRect, view.dom),
    };
  },
}));

export interface ActiveCellColumnPositionerData {
  pos: number;
  rect: DOMRect;
}

/**
 * Creates a positioner for the current column in a table
 *
 * It spans the full width and height of the column containing the current cell
 */
export const activeCellColumnPositioner = Positioner.create<ActiveCellColumnPositionerData>({
  hasChanged: hasStateChanged,

  getActive(props) {
    const { state, view } = props;
    const { selection } = state;
    const table = findTable(selection);

    if (!table) {
      return Positioner.EMPTY;
    }

    const cell = findCellClosestToPos(selection);

    if (!cell) {
      return Positioner.EMPTY;
    }

    const { pos } = cell;
    const tableNode = view.nodeDOM(table.pos);
    const node = view.nodeDOM(pos);

    if (!isElementDomNode(tableNode) || !isElementDomNode(node)) {
      // This should never happen.
      return Positioner.EMPTY;
    }

    const tableRect = tableNode.getBoundingClientRect();
    const rect = node.getBoundingClientRect();

    return [
      {
        pos,
        rect: new DOMRect(rect.x, tableRect.y, rect.width, tableRect.height),
      },
    ];
  },

  getID({ pos }) {
    return `${pos}`;
  },

  getPosition(props) {
    const {
      view,
      data: { rect },
    } = props;

    const editorRect = view.dom.getBoundingClientRect();

    const height = rect.height;
    const width = rect.width;

    // The top and left relative to the parent `editorRect`.
    const left = view.dom.scrollLeft + rect.left - editorRect.left - 1;
    const top = view.dom.scrollTop + rect.top - editorRect.top - 1;

    return {
      x: left,
      y: top,
      width,
      height,
      rect,
      visible: isPositionVisible(rect, view.dom),
    };
  },
});

export type ActiveCellRowPositionerData = ActiveCellColumnPositionerData;

/**
 * Creates a positioner for the current row in a table
 *
 * It spans the full width and height of the row containing the current cell
 */
export const activeCellRowPositioner = activeCellColumnPositioner.clone(() => ({
  getActive(props) {
    const { state, view } = props;
    const { selection } = state;
    const table = findTable(selection);

    if (!table) {
      return Positioner.EMPTY;
    }

    const cell = findCellClosestToPos(selection);

    if (!cell) {
      return Positioner.EMPTY;
    }

    const { pos } = cell;
    const tableNode = view.nodeDOM(table.pos);
    const node = view.nodeDOM(pos);

    if (!isElementDomNode(tableNode) || !isElementDomNode(node)) {
      // This should never happen.
      return Positioner.EMPTY;
    }

    const tableRect = tableNode.getBoundingClientRect();
    const rect = node.getBoundingClientRect();

    return [
      {
        pos,
        rect: new DOMRect(tableRect.x, rect.y, tableRect.width, rect.height),
      },
    ];
  },
}));

/**
 * Creates a positioner for the current column in a table if the whole column is selected
 *
 * It spans the full width and height of a selected single column
 */
export const selectedColumnPositioner = activeCellColumnPositioner.clone(({ getActive }) => ({
  getActive(props) {
    const [data] = getActive(props);

    if (!data) {
      return Positioner.EMPTY;
    }

    const { selection } = props.state;

    if (!isCellSelection(selection) || !selection.isColSelection()) {
      return Positioner.EMPTY;
    }

    const table = findTable(selection);

    if (!table) {
      return Positioner.EMPTY;
    }

    const { node, start } = table;
    const { $anchorCell, $headCell } = selection;

    const map = TableMap.get(node);
    const rect = map.rectBetween($anchorCell.pos - start, $headCell.pos - start);

    if (rect.right - rect.left !== 1) {
      // Return false if more than one column selected
      return Positioner.EMPTY;
    }

    return [data];
  },
}));

/**
 * Creates a positioner for the current row in a table if the whole row is selected
 *
 * It spans the full width and height of a selected single row
 */
export const selectedRowPositioner = activeCellRowPositioner.clone(({ getActive }) => ({
  getActive(props) {
    const [data] = getActive(props);

    if (!data) {
      return Positioner.EMPTY;
    }

    const { selection } = props.state;

    if (!isCellSelection(selection) || !selection.isRowSelection()) {
      return Positioner.EMPTY;
    }

    const table = findTable(selection);

    if (!table) {
      return Positioner.EMPTY;
    }

    const { node, start } = table;
    const { $anchorCell, $headCell } = selection;

    const map = TableMap.get(node);
    const rect = map.rectBetween($anchorCell.pos - start, $headCell.pos - start);

    if (rect.bottom - rect.top !== 1) {
      // Return false if more than one row selected
      return Positioner.EMPTY;
    }

    return [data];
  },
}));

/**
 * Creates a positioner for the current cell selection in a table
 *
 * It spans the full width and height of the selected cells
 */
export const cellSelectionPositioner = Positioner.create<CellSelection>({
  hasChanged: hasStateChanged,

  getActive(props) {
    const { selection } = props.state;

    if (!isCellSelection(selection)) {
      return Positioner.EMPTY;
    }

    return [selection];
  },

  getPosition(props) {
    const { view, data: selection } = props;

    const { $headCell, $anchorCell } = selection;

    const headNode = view.nodeDOM($headCell.pos);
    const anchorNode = view.nodeDOM($anchorCell.pos);

    if (!isElementDomNode(headNode) || !isElementDomNode(anchorNode)) {
      return defaultAbsolutePosition;
    }

    const rect = mergeDOMRects(
      headNode.getBoundingClientRect(),
      anchorNode.getBoundingClientRect(),
    );

    const editorRect = view.dom.getBoundingClientRect();

    const height = rect.height;
    const width = rect.width;

    // The top and left relative to the parent `editorRect`.
    const left = view.dom.scrollLeft + rect.left - editorRect.left - 1;
    const top = view.dom.scrollTop + rect.top - editorRect.top - 1;

    return {
      x: left,
      y: top,
      width,
      height,
      rect,
      visible: isPositionVisible(rect, view.dom),
    };
  },
});

/**
 * Creates a positioner if the cell selection goes all the way from the top to the bottom of the table
 *
 * It spans the full width and height of the selected cells
 */
export const cellColumnSelectionPositioner = cellSelectionPositioner.clone(({ getActive }) => ({
  getActive(props) {
    const [selection] = getActive(props);

    if (!selection?.isColSelection()) {
      return Positioner.EMPTY;
    }

    return [selection];
  },
}));

/**
 * Creates a positioner if the cell selection goes all the way from the left to the right of the table
 *
 * It spans the full width and height of the selected cells
 */
export const cellRowSelectionPositioner = cellSelectionPositioner.clone(({ getActive }) => ({
  getActive(props) {
    const [selection] = getActive(props);

    if (!selection?.isRowSelection()) {
      return Positioner.EMPTY;
    }

    return [selection];
  },
}));

/**
 * Creates a positioner if all the cells in a table are selected
 *
 * It spans the full width and height of the selected cells (the entire table)
 */
export const allCellSelectionPositioner = cellSelectionPositioner.clone(({ getActive }) => ({
  getActive(props) {
    const [selection] = getActive(props);

    if (!selection?.isColSelection() || !selection.isRowSelection()) {
      return Positioner.EMPTY;
    }

    return [selection];
  },
}));
