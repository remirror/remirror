import {
  ApplySchemaAttributes,
  CommandFunction,
  CommandFunctionParameter,
  convertCommand,
  extensionDecorator,
  ExtensionTag,
  NodeExtension,
  OnSetOptionsParameter,
} from '@remirror/core';
import { TextSelection } from '@remirror/pm/state';
import {
  addColumnAfter,
  addColumnBefore,
  addRowAfter,
  addRowBefore,
  columnResizing,
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

export interface TableOptions {
  /**
   * When true the table will be resizable.
   *
   * @default true
   */
  resizable?: boolean;
}

let tablesEnabled = false;

@extensionDecorator<TableOptions>({
  defaultOptions: {
    resizable: true,
  },
})
export class TableExtension extends NodeExtension<TableOptions> {
  get name() {
    return 'table' as const;
  }

  readonly tags = [ExtensionTag.BlockNode];

  createNodeSpec(extra: ApplySchemaAttributes): TableSchemaSpec {
    return createTableNodeSchema(extra).table;
  }

  /**
   * Add the table plugins to the editor.
   */
  createExternalPlugins() {
    return [tableEditing(), columnResizing({})];
  }

  /**
   * Create the commands that can be used for the table.
   */
  createCommands() {
    return {
      /**
       * Create a table in the editor at the current selection point.
       */
      createTable: (
        parameter: Pick<CreateTableParameter, 'rowsCount' | 'columnsCount' | 'withHeaderRow'>,
      ): CommandFunction => ({ tr, dispatch, state }) => {
        if (!tr.selection.empty) {
          return false;
        }

        const offset = tr.selection.anchor + 1;
        const nodes = createTable({ schema: state.schema, ...parameter });

        if (dispatch) {
          tr.replaceSelectionWith(nodes).scrollIntoView();
          const resolvedPos = tr.doc.resolve(offset);

          tr.setSelection(TextSelection.near(resolvedPos));
          dispatch(tr);
        }

        return true;
      },

      /**
       * Delete the table.
       */
      deleteTable: () => convertCommand(deleteTable),

      /**
       * Command to add a column before the column with the selection.
       */
      addTableColumnBefore: () => {
        return convertCommand(addColumnBefore);
      },

      /**
       * Command to add a column after the column with the selection.
       */
      addTableColumnAfter: () => convertCommand(addColumnAfter),

      /**
       * Remove selected column from the table.
       */
      deleteTableColumn: () => convertCommand(deleteColumn),

      /**
       * Add a table row before the current selection.
       */
      addTableRowBefore: () => convertCommand(addRowBefore),

      /**
       * Add a table row after the current selection.
       */
      addTableRowAfter: () => convertCommand(addRowAfter),

      /**
       * Delete the table row at the current selection.
       */
      deleteTableRow: () => convertCommand(deleteRow),

      /**
       * Toggles between merging cells.
       */
      toggleTableCellMerge: () => toggleMergeCellCommand,

      /**
       * Merge the table cells.
       */
      mergeTableCells: () => convertCommand(mergeCells),

      /**
       * Split the merged cells into individual cells.
       */
      splitTableCell: () => convertCommand(splitCell),

      /**
       * Toggles a column as the header column.
       */
      toggleTableHeaderColumn: () => convertCommand(toggleHeaderColumn),

      /**
       * Toggles a row as a table header row.
       */
      toggleTableHeaderRow: () => convertCommand(toggleHeaderRow),

      /**
       * Toggle a cell as a table header cell.
       */
      toggleTableHeaderCell: () => convertCommand(toggleHeaderCell),

      /**
       * Set the attribute for a table cell.
       */
      setTableCellAttribute: (name: string, value: unknown) =>
        convertCommand(setCellAttr(name, value)),

      /**
       * Fix all tables within the document.
       */
      fixTables: () => fixTablesCommand,
    };
  }

  createHelpers() {
    return {
      /**
       * Enable table usage within the editor. This depends on the editor.
       */
      enableTableSupport: () => {
        if (tablesEnabled) {
          return;
        }

        document.execCommand('enableObjectResizing', false, 'false');
        document.execCommand('enableInlineTableEditing', false, 'false');
        tablesEnabled = true;
      },
    };
  }

  /**
   * This managers the updates of the collaboration provider.
   */
  protected onSetOptions(parameter: OnSetOptionsParameter<TableOptions>) {
    const { changes } = parameter;

    // TODO move this into a new method in `plugins-extension`.
    if (changes.resizable.changed) {
      const previousPlugins = this.externalPlugins;
      const newPlugins = (this.externalPlugins = this.createExternalPlugins());

      this.store.addOrReplacePlugins(newPlugins, previousPlugins);
      this.store.reconfigureStatePlugins();
    }
  }
}

/**
 * The extension for a table row node.
 */
@extensionDecorator({})
export class TableRowExtension extends NodeExtension {
  get name() {
    return 'tableRow' as const;
  }

  createNodeSpec(extra: ApplySchemaAttributes): TableSchemaSpec {
    return createTableNodeSchema(extra).tableRow;
  }
}

/**
 * The extension for a table cell node.
 */
@extensionDecorator({})
export class TableCellExtension extends NodeExtension {
  get name() {
    return 'tableCell' as const;
  }

  createNodeSpec(extra: ApplySchemaAttributes): TableSchemaSpec {
    return createTableNodeSchema(extra).tableCell;
  }
}

/**
 * The extension for the table header node.
 */
@extensionDecorator({})
export class TableHeaderCellExtension extends NodeExtension {
  get name() {
    return 'tableHeaderCell' as const;
  }

  createNodeSpec(extra: ApplySchemaAttributes): TableSchemaSpec {
    return createTableNodeSchema(extra).tableHeaderCell;
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
