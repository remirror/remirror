import {
  ApplySchemaAttributes,
  EditorSchema,
  ErrorConstant,
  ExtensionTag,
  includes,
  invariant,
  NodeExtensionSpec,
  NodeSpecOverride,
  NodeType,
  object,
  SchemaProps,
  values,
} from '@remirror/core';
import { ExtensionTablesMessages } from '@remirror/messages';
import type { Node as ProsemirrorNode } from '@remirror/pm/model';

export interface TableSchemaSpec extends NodeExtensionSpec {
  tableRole: TableRole;
}

export interface CreateTableCommand {
  /**
   * Defines the number of rows to create with.
   *
   * @default 3
   */
  rowsCount?: number;

  /**
   * Defines the number of columns to create with.
   *
   * @default 3
   */
  columnsCount?: number;
  /**
   * When true the first row of the table will be a header row.
   *
   * @default true
   */
  withHeaderRow?: boolean;

  /**
   * Defines the content of each cell as a prosemirror node.
   *
   * @default undefined
   */
  cellContent?: ProsemirrorNode;
}

export interface CreateTableProps extends SchemaProps, CreateTableCommand {}

// Helper for creating a schema that supports tables.

function getCellAttrs(dom: HTMLElement) {
  const widthAttr = dom.getAttribute('data-colwidth');
  const widths =
    widthAttr && /^\d+(,\d+)*$/.test(widthAttr) ? widthAttr.split(',').map((s) => Number(s)) : null;
  const colspan = Number(dom.getAttribute('colspan') ?? 1);
  return {
    colspan,
    rowspan: Number(dom.getAttribute('rowspan') ?? 1),
    colwidth: widths && widths.length === colspan ? widths : null,
    background: dom.style.backgroundColor || null,
  };
}

function setCellAttrs(node: ProsemirrorNode) {
  const attrs: Record<string, string> = {};

  if (node.attrs.colspan !== 1) {
    attrs.colspan = node.attrs.colspan;
  }

  if (node.attrs.rowspan !== 1) {
    attrs.rowspan = node.attrs.rowspan;
  }

  if (node.attrs.colwidth) {
    attrs['data-colwidth'] = node.attrs.colwidth.join(',');
  }

  if (node.attrs.background) {
    attrs.style = `${attrs.style ?? ''}background-color: ${node.attrs.background as string};`;
  }

  return attrs;
}

/**
 * This function creates the base for the tableNode ProseMirror specs.
 */
export function createTableNodeSchema(
  extra: ApplySchemaAttributes,
  override: NodeSpecOverride,
): Record<'table' | 'tableRow' | 'tableCell' | 'tableHeaderCell', TableSchemaSpec> {
  const cellAttrs = {
    ...extra.defaults(),
    colspan: { default: 1 },
    rowspan: { default: 1 },
    colwidth: { default: null },
    background: { default: null },
  };

  return {
    table: {
      isolating: true,
      ...override,
      attrs: extra.defaults(),
      content: 'tableRow+',
      tableRole: 'table',
      parseDOM: [{ tag: 'table', getAttrs: extra.parse }, ...(override.parseDOM ?? [])],
      toDOM(node) {
        return ['table', ['tbody', extra.dom(node), 0]];
      },
    },

    tableRow: {
      ...override,
      attrs: extra.defaults(),
      content: '(tableCell | tableHeaderCell)*',
      tableRole: 'row',
      parseDOM: [{ tag: 'tr', getAttrs: extra.parse }, ...(override.parseDOM ?? [])],
      toDOM(node) {
        return ['tr', extra.dom(node), 0];
      },
    },

    tableCell: {
      isolating: true,
      content: `${ExtensionTag.Block}+`,
      ...override,
      attrs: cellAttrs,
      tableRole: 'cell',
      parseDOM: [
        {
          tag: 'td',
          getAttrs: (dom) => ({ ...extra.parse(dom), ...getCellAttrs(dom as HTMLElement) }),
        },
        ...(override.parseDOM ?? []),
      ],
      toDOM(node) {
        return ['td', { ...extra.dom(node), ...setCellAttrs(node) }, 0];
      },
    },

    tableHeaderCell: {
      isolating: true,
      content: `${ExtensionTag.Block}+`,
      ...override,
      attrs: cellAttrs,
      tableRole: 'header_cell',
      parseDOM: [
        {
          tag: 'th',
          getAttrs: (dom) => ({ ...extra.parse(dom), ...getCellAttrs(dom as HTMLElement) }),
        },
        ...(override.parseDOM ?? []),
      ],
      toDOM(node) {
        return ['th', { ...extra.dom(node), ...setCellAttrs(node) }, 0];
      },
    },
  };
}

const TABLE_ROLES = ['table', 'row', 'cell', 'header_cell'] as const;
export type TableRole = typeof TABLE_ROLES[number];

/**
 * Returns a map where keys are tableRoles and values are NodeTypes.
 */
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

interface CreateCellProps {
  type: NodeType;
  content?: ProsemirrorNode;
}

/**
 * Create a cell with the provided content.
 */
function createCell(props: CreateCellProps) {
  const { content, type } = props;

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
export function createTable(props: CreateTableProps): ProsemirrorNode<EditorSchema> {
  const { schema, cellContent, columnsCount = 3, rowsCount = 3, withHeaderRow = true } = props;
  const {
    cell: tableCell,
    header_cell: tableHeaderCell,
    row: tableRow,
    table,
  } = tableNodeTypes(schema);

  invariant(tableCell && tableHeaderCell && tableRow && table, {
    code: ErrorConstant.EXTENSION,
    message: 'Table Extension unable to locate required nodes.',
  });

  const cells: ProsemirrorNode[] = [];
  const headerCells: ProsemirrorNode[] = [];

  for (let ii = 0; ii < columnsCount; ii++) {
    cells.push(createCell({ type: tableCell, content: cellContent }) as ProsemirrorNode);

    if (withHeaderRow) {
      headerCells.push(
        createCell({ type: tableHeaderCell, content: cellContent }) as ProsemirrorNode,
      );
    }
  }

  const rows: ProsemirrorNode[] = [];

  for (let ii = 0; ii < rowsCount; ii++) {
    const rowNodes = withHeaderRow && ii === 0 ? headerCells : cells;
    rows.push(tableRow.createChecked(null, rowNodes));
  }

  return table.createChecked(null, rows);
}

const { CREATE_COMMAND_DESCRIPTION, CREATE_COMMAND_LABEL } = ExtensionTablesMessages;

export const createTableOptions: Remirror.CommandDecoratorOptions = {
  icon: 'table2',
  description: ({ t }) => t(CREATE_COMMAND_DESCRIPTION),
  label: ({ t }) => t(CREATE_COMMAND_LABEL),
};
