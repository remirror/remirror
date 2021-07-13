import { findParentNodeOfType, FindProsemirrorNodeResult, Selection } from '@remirror/core';
import { blockNodePositioner, Positioner } from '@remirror/extension-positioner';
import { CellSelection } from '@remirror/pm/tables';

const cellNodeTypes: string[] = ['tableCell', 'tableHeaderCell'];

// When the selection is a CellSelection and there is only one cell in the selection, return the cell.
function findMenuTableCell(selection: Selection): FindProsemirrorNodeResult | undefined | null {
  // If the selection is a CellSelection, then we show the cell menu inside the head cell.
  if (selection instanceof CellSelection) {
    return findParentNodeOfType({ selection: selection.$head, types: cellNodeTypes });
  }

  return findParentNodeOfType({ selection: selection, types: cellNodeTypes });
}

/**
 * Creates a positioner for the current table cell node which will show the
 * cell menu.
 *
 * It spans the full width and height of the table cell node.
 */
export const menuCellPositioner = blockNodePositioner.clone(() => ({
  getActive: (props) => {
    const result = findMenuTableCell(props.state.selection);
    return result ? [result] : Positioner.EMPTY;
  },
}));
