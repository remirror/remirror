import {
  CommandFunction,
  CommandFunctionParameter,
  convertCommand,
  EditorSchema,
  includes,
  NodeExtension,
  NodeExtensionSpec,
  NodeGroup,
  NodeType,
  NodeTypeParameter,
  object,
  ProsemirrorNode,
  SchemaParameter,
  values,
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

export class TableExtension extends NodeExtension {
  get name() {
    return 'table';
  }

  createNodeSpec(): TableSchemaSpec {
    return {
      content: 'tableRow+',
      tableRole: 'table',
      isolating: true,
      group: NodeGroup.Block,
      parseDOM: [{ tag: 'table' }],
      toDOM() {
        return ['table', 0];
      },
    };
  }

  /**
   * Add the table plugins to the editor.
   */
  createExternalPlugins = () => {
    return [tableEditing()];
  };

  createCommands = () => {
    return {
      tableAddColumnAfter: () => convertCommand(addColumnAfter),
      tableAddColumnBefore: () => convertCommand(addColumnBefore),
      tableAddRowAfter: () => convertCommand(addRowAfter),
      tableAddRowBefore: () => convertCommand(addRowBefore),
      tableDeleteColumn: () => convertCommand(deleteColumn),
      tableDeleteRow: () => convertCommand(deleteRow),

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
       * Remove selected rows from the table.
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
      setTableCellAttr: (name: string, value: any) => convertCommand(setCellAttr(name, value)),

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

  createNodeSpec(): TableSchemaSpec {
    return {
      content: 'tableCell+',
      tableRole: 'row',
      parseDOM: [{ tag: 'tr' }],
      toDOM() {
        return ['tr', 0];
      },
    };
  }
}

export class TableCellExtension extends NodeExtension {
  get name() {
    return 'tableCell' as const;
  }

  createNodeSpec(): TableSchemaSpec {
    return {
      content: 'inline*',
      attrs: cellAttributes,
      tableRole: 'cell',
      isolating: true,
      parseDOM: [{ tag: 'td' }, { tag: 'th' }],
      toDOM() {
        return ['td', 0];
      },
    };
  }
}

export class TableHeaderCell extends NodeExtension {
  get name() {
    return 'tableHeader' as const;
  }

  createNodeSpec(): TableSchemaSpec {
    return {
      content: 'inline*',
      attrs: cellAttributes,
      tableRole: 'header',
      isolating: true,
      parseDOM: [{ tag: 'th' }, { tag: 'th' }],
      toDOM() {
        return ['th', 0];
      },
    };
  }
}

const cellAttributes = {
  colspan: { default: 1 },
  rowspan: { default: 1 },
  colwidth: { default: null },
};

const TABLE_ROLES = ['table', 'row', 'cell', 'header'] as const;
type TableRole = typeof TABLE_ROLES[number];

export interface TableSchemaSpec extends NodeExtensionSpec {
  tableRole: TableRole;
}

interface CreateTableParameter extends SchemaParameter {
  /**
   * Defines the number of rows to create with.
   *
   * @defaultValue 3
   */
  rowsCount?: number;

  /**
   * Defines the number of columns to create with.
   *
   * @defaultValue 3
   */
  columnsCount?: number;
  /**
   * When true the first row of the table will be a header row.
   *
   * @defaultValue true
   */
  withHeaderRow?: boolean;

  /**
   * Defines the content of each cell as a prosemirror node.
   *
   * @defaultValue undefined
   */
  cellContent?: ProsemirrorNode;
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

/** Returns a map where keys are tableRoles and values are NodeTypes. */
function tableNodeTypes(schema: EditorSchema): Record<string, NodeType> {
  if (schema.cached.tableNodeTypes) {
    return schema.cached.tableNodeTypes;
  }

  const roles: Record<TableRole, NodeType> = object();
  schema.cached.tableNodeTypes = roles;

  for (const nodeType of values(schema.nodes)) {
    if (includes(TABLE_ROLES, nodeType.spec.tableRole)) {
      roles[nodeType.spec.tableRole] = nodeType;
    }
  }

  return roles;
}

interface CreateCellParameter extends NodeTypeParameter {
  content?: ProsemirrorNode;
}

/**
 * Create a cell with the provided content.
 */
function createCell(parameter: CreateCellParameter) {
  const { content, type } = parameter;

  if (content) {
    return type.createChecked(null, content);
  }

  return type.createAndFill();
}

/**
 * Returns a table node of a given size.
 *
 * @remarks
 *
 * ```ts
 * const table = createTable({ schema: state.schema }); // 3x3 table node
 * dispatch(tr.replaceSelectionWith(table).scrollIntoView());
 * ```
 */
function createTable(parameter: CreateTableParameter) {
  const { schema, cellContent, columnsCount = 3, rowsCount = 3, withHeaderRow = true } = parameter;
  const { cell: tableCell, header_cell: tableHeader, row: tableRow, table } = tableNodeTypes(
    schema,
  );

  const cells: ProsemirrorNode[] = [];
  const headerCells: ProsemirrorNode[] = [];
  for (let ii = 0; ii < columnsCount; ii++) {
    cells.push(createCell({ type: tableCell, content: cellContent }) as ProsemirrorNode);

    if (withHeaderRow) {
      headerCells.push(createCell({ type: tableHeader, content: cellContent }) as ProsemirrorNode);
    }
  }

  const rows: ProsemirrorNode[] = [];
  for (let ii = 0; ii < rowsCount; ii++) {
    const rowNodes = withHeaderRow && ii === 0 ? headerCells : cells;
    rows.push(tableRow.createChecked(null, rowNodes));
  }

  return table.createChecked(null, rows);
}
