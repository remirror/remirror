import {
  ApplySchemaAttributes,
  EditorSchema,
  includes,
  NodeExtensionSpec,
  NodeGroup,
  NodeType,
  NodeTypeParameter,
  object,
  SchemaParameter,
  values,
} from '@remirror/core';
import { Node as ProsemirrorNode } from '@remirror/pm/model';

export interface TableSchemaSpec extends NodeExtensionSpec {
  tableRole: TableRole;
}

export interface CreateTableParameter extends SchemaParameter {
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
    attrs.style = `${attrs.style || ''}background-color: ${node.attrs.background as string};`;
  }

  return attrs;
}

// :: (Object) → Object
//
// This function creates a set of [node
// specs](http://prosemirror.net/docs/ref/#model.SchemaSpec.nodes) for
// `table`, `table_row`, and `table_cell` nodes types as used by this
// module. The result can then be added to the set of nodes when
// creating a a schema.
//
//   options::- The following options are understood:
//
//     tableGroup:: ?string
//     A group name (something like `"block"`) to add to the table
//     node type.
//
//     cellContent:: string
//     The content expression for table cells.
//
//     cellAttributes:: ?Object
//     Additional attributes to add to cells. Maps attribute names to
//     objects with the following properties:
//
//       default:: any
//       The attribute's default value.
//
//       getFromDOM:: ?(dom.Node) → any
//       A function to read the attribute's value from a DOM node.
//
//       setDOMAttr:: ?(value: any, attrs: Object)
//       A function to add the attribute's value to an attribute
//       object that's used to render the cell's DOM.
export function createTableNodeSchema(
  extra: ApplySchemaAttributes,
): Record<'table' | 'tableRow' | 'tableCell' | 'tableHeader', TableSchemaSpec> {
  const cellAttrs = {
    ...extra.defaults(),
    colspan: { default: 1 },
    rowspan: { default: 1 },
    colwidth: { default: null },
    background: { default: null },
  };

  return {
    table: {
      attrs: extra.defaults(),
      content: 'tableRow+',
      tableRole: 'table',
      isolating: true,
      group: NodeGroup.Block,
      parseDOM: [{ tag: 'table', getAttrs: extra.parse }],
      toDOM(node) {
        return ['table', ['tbody', extra.dom(node), 0]];
      },
    },

    tableRow: {
      attrs: extra.defaults(),
      content: '(tableCell | tableHeader)*',
      tableRole: 'row',
      parseDOM: [{ tag: 'tr', getAttrs: extra.parse }],
      toDOM(node) {
        return ['tr', extra.dom(node), 0];
      },
    },

    tableCell: {
      content: `${NodeGroup.Block}+`,
      attrs: cellAttrs,
      tableRole: 'cell',
      isolating: true,
      parseDOM: [
        {
          tag: 'td',
          getAttrs: (dom) => ({ ...extra.parse(dom), ...getCellAttrs(dom as HTMLElement) }),
        },
      ],
      toDOM(node) {
        return ['td', { ...extra.dom(node), ...setCellAttrs(node) }, 0];
      },
    },

    tableHeader: {
      content: `${NodeGroup.Block}+`,
      attrs: cellAttrs,
      tableRole: 'header_cell',
      isolating: true,
      parseDOM: [
        {
          tag: 'th',
          getAttrs: (dom) => ({ ...extra.parse(dom), ...getCellAttrs(dom as HTMLElement) }),
        },
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
export function createTable(parameter: CreateTableParameter) {
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
