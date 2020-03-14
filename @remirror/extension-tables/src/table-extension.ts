import {
  addColumnAfter,
  addColumnBefore,
  addRowAfter,
  addRowBefore,
  deleteColumn,
  deleteRow,
  deleteTable,
  tableEditing,
} from 'prosemirror-tables';

import { NodeExtension } from '@remirror/core';

import { TableSchemaSpec } from './table-types';

export class TableExtension extends NodeExtension {
  public readonly name = 'table';

  public readonly schema: TableSchemaSpec = {
    content: 'tableRow+',
    tableRole: 'table',
    isolating: true,
    group: 'block',
    parseDOM: [{ tag: 'table' }],
    toDOM() {
      return ['table', 0];
    },
  };

  public plugin() {
    return tableEditing();
  }

  public commands() {
    return {
      tableAddColumnAfter: () => addColumnAfter,
      tableAddColumnBefore: () => addColumnBefore,
      tableAddRowAfter: () => addRowAfter,
      tableAddRowBefore: () => addRowBefore,
      tableDeleteColumn: () => deleteColumn,
      tableDeleteRow: () => deleteRow,
      tableDeleteTable: () => deleteTable,
    };
  }
}

export class TableRowExtension extends NodeExtension {
  public readonly name = 'tableRow';

  public readonly schema: TableSchemaSpec = {
    content: 'tableCell+',
    tableRole: 'row',
    parseDOM: [{ tag: 'tr' }],
    toDOM() {
      return ['tr', 0];
    },
  };
}

export class TableCellExtension extends NodeExtension {
  public readonly name = 'tableCell';

  public readonly schema: TableSchemaSpec = {
    content: 'inline*',
    attrs: {
      colspan: {
        default: 1,
      },
      rowspan: {
        default: 1,
      },
      colwidth: {
        default: null,
      },
    },
    tableRole: 'cell',
    isolating: true,
    parseDOM: [{ tag: 'td' }, { tag: 'th' }],
    toDOM() {
      return ['td', 0];
    },
  };
}
