import {
  ApplySchemaAttributes,
  CommandFunction,
  CommandFunctionParameter,
  convertCommand,
  NodeExtension,
} from '@remirror/core';
import { TextSelection } from '@remirror/pm/state';
import {
  addColumnAfter,
  addColumnBefore,
  addRowAfter,
  addRowBefore,
  deleteColumn,
  deleteRow,
  deleteTable,
  fixTables,
  mergeCells,
  setCellAttr,
  splitCell,
  tableEditing,
  toggleHeaderCell,
  toggleHeaderColumn,
  toggleHeaderRow,
} from '@remirror/pm/tables';

import {
  createTable,
  createTableNodeSchema,
  CreateTableParameter,
  TableSchemaSpec,
} from './table-utils';

export class TableExtension extends NodeExtension {
  get name() {
    return 'table' as const;
  }

  createNodeSpec(extra: ApplySchemaAttributes): TableSchemaSpec {
    return createTableNodeSchema(extra).table;
  }

  /**
   * Add the table plugins to the editor.
   */
  createExternalPlugins = () => {
    return [tableEditing()];
  };

  createCommands = () => {
    return {
      createTable: (
        parameter: Pick<CreateTableParameter, 'rowsCount' | 'columnsCount' | 'withHeaderRow'>,
      ): CommandFunction => ({ state, dispatch }) => {
        const offset = state.tr.selection.anchor + 1;
        const nodes = createTable({ schema: state.schema, ...parameter });
        const tr = state.tr.replaceSelectionWith(nodes).scrollIntoView();
        const resolvedPos = tr.doc.resolve(offset);

        tr.setSelection(TextSelection.near(resolvedPos));

        if (dispatch) {
          dispatch(tr);
        }

        return true;
      },

      /**
       * Command to add a column before the column with the selection.
       */
      addTableColumnBefore: () => convertCommand(addColumnBefore),

      /**
       * Command to add a column after the column with the selection.
       */
      addTableColumnAfter: () => convertCommand(addColumnAfter),

      /**
       * Remove selected column from the table.
       */
      deleteTableColumn: () => convertCommand(deleteColumn),
      addTableRowBefore: () => convertCommand(addRowBefore),
      addTableRowAfter: () => convertCommand(addRowAfter),
      deleteTableRow: () => convertCommand(deleteRow),
      deleteTable: () => convertCommand(deleteTable),
      toggleTableCellMerge: () => toggleMergeCellCommand,
      mergeTableCells: () => convertCommand(mergeCells),
      splitTableCell: () => convertCommand(splitCell),
      toggleTableHeaderColumn: () => convertCommand(toggleHeaderColumn),
      toggleTableHeaderRow: () => convertCommand(toggleHeaderRow),
      toggleTableHeaderCell: () => convertCommand(toggleHeaderCell),
      setTableCellAttribute: (name: string, value: unknown) =>
        convertCommand(setCellAttr(name, value)),

      /**
       * Fix all tables within the document.
       */
      fixTables: () => fixTablesCommand,
    };
  };
}

export class TableRowExtension extends NodeExtension {
  get name() {
    return 'tableRow' as const;
  }

  createNodeSpec(extra: ApplySchemaAttributes): TableSchemaSpec {
    return createTableNodeSchema(extra).tableRow;
  }
}

export class TableCellExtension extends NodeExtension {
  get name() {
    return 'tableCell' as const;
  }

  createNodeSpec(extra: ApplySchemaAttributes): TableSchemaSpec {
    return createTableNodeSchema(extra).tableCell;
  }
}

export class TableHeaderCell extends NodeExtension {
  get name() {
    return 'tableHeader' as const;
  }

  createNodeSpec(extra: ApplySchemaAttributes): TableSchemaSpec {
    return createTableNodeSchema(extra).tableHeader;
  }
}

function fixTablesCommand({ state, dispatch }: CommandFunctionParameter) {
  const tr = fixTables(state);

  if (!tr) {
    return false;
  }

  if (dispatch) {
    dispatch(tr);
  }

  return true;
}

function toggleMergeCellCommand({ state, dispatch }: CommandFunctionParameter) {
  if (mergeCells(state, dispatch)) {
    return false;
  }

  return splitCell(state, dispatch);
}
