import {
  ApplySchemaAttributes,
  command,
  CommandFunction,
  convertCommand,
  Decoration,
  EditorView,
  ExtensionPriority,
  NodeExtension,
  NodeSpecOverride,
  NodeViewMethod,
  ProsemirrorNode,
  ProsemirrorPlugin,
} from '@remirror/core';
import type { CreateTableCommand, TableSchemaSpec } from '@remirror/extension-tables';
import {
  createTable,
  createTableOptions,
  TableCellExtension as BaseTableCellExtension,
  TableExtension as BaseTableExtension,
  TableHeaderCellExtension as BaseTableHeaderCellExtension,
  TableRowExtension as BaseTableRowExtension,
} from '@remirror/extension-tables';
import { TextSelection } from '@remirror/pm/state';
import { tableEditing, TableMap } from '@remirror/pm/tables';

import { InsertButtonAttrs } from './components/table-insert-button';
import { addColumnAfter, addColumnBefore, addRowAfter, addRowBefore } from './react-table-commands';
import { columnResizing } from './table-column-resizing';
import { createTableControllerPlugin } from './table-plugins';
import { injectControllers } from './utils/controller';
import { TableControllerCellView } from './views/table-controller-cell-view';
import { TableView } from './views/table-view';

export type ReactTableNodeAttrs<T extends Record<string, any> = Record<never, never>> = T & {
  isControllersInjected: boolean;

  // if and only if `insertButtonAttrs` exists, InsertButton will show.
  // TODO: move insertButtonAttrs to ControllerPlugin
  insertButtonAttrs: InsertButtonAttrs | null;
};

export class TableExtension extends BaseTableExtension {
  get name() {
    return 'table' as const;
  }

  createNodeViews(): NodeViewMethod {
    return (
      node: ProsemirrorNode,
      view: EditorView,
      getPos: boolean | (() => number),
      decorations: Decoration[],
    ) => {
      return new TableView(node, 10, decorations, view, getPos as () => number);
    };
  }

  /**
   * Add the table plugins to the editor.
   */
  createExternalPlugins(): ProsemirrorPlugin[] {
    const plugins = [tableEditing(), createTableControllerPlugin()];

    if (this.options.resizable) {
      plugins.push(columnResizing({ firstResizableColumn: 1 }));
    }

    return plugins;
  }

  createNodeSpec(extra: ApplySchemaAttributes): TableSchemaSpec {
    const spec: TableSchemaSpec = {
      isolating: true,
      attrs: {
        ...extra.defaults(),
        isControllersInjected: { default: false },
        insertButtonAttrs: { default: null },
      },
      content: 'tableRow+',
      tableRole: 'table',
      parseDOM: [{ tag: 'table', getAttrs: extra.parse }],
      toDOM(node) {
        return ['table', ['tbody', extra.dom(node), 0]];
      },
      allowGapCursor: false,
    };
    return spec;
  }

  /**
   * Create the table extensions. Set the priority to low so that they appear
   * lower down in the node list.
   */
  createExtensions() {
    return [new TableRowExtension({ priority: ExtensionPriority.Low })];
  }

  onView(): void {
    // We have multiple node types which share a eom table_row in this
    // extentison. In order to make the function `tableNodeTypes` from
    // `prosemirror-extension-tables` return the correct node type, we
    // need to overwrite `schema.cached.tableNodeTypes`.
    const schema = this.store.schema;
    schema.cached.tableNodeTypes = {
      cell: schema.nodes.tableCell,
      row: schema.nodes.tableRow,
      table: schema.nodes.table,
      header_cell: schema.nodes.tableHeaderCell,
    };
  }

  /**
   * Create a table in the editor at the current selection point.
   */
  @command(createTableOptions)
  createTable(options: CreateTableCommand = {}): CommandFunction {
    return (props) => {
      const { tr, dispatch, state } = props;

      if (!tr.selection.empty) {
        return false;
      }

      const { schema } = state;
      const offset = tr.selection.anchor + 1;

      const table = createTable({ schema, ...options });
      const controlledTable = injectControllers({
        schema,
        getMap: () => TableMap.get(table),
        table,
      });

      dispatch?.(
        tr
          .replaceSelectionWith(controlledTable)
          .scrollIntoView()
          .setSelection(TextSelection.near(tr.doc.resolve(offset))),
      );

      return true;
    };
  }

  /**
   * Command to add a column before the column with the selection.
   */
  @command()
  addTableColumnBefore(): CommandFunction {
    return convertCommand(addColumnBefore);
  }

  /**
   * Command to add a column after the column with the selection.
   */
  @command()
  addTableColumnAfter(): CommandFunction {
    return convertCommand(addColumnAfter);
  }

  /**
   * Add a table row before the current selection.
   */
  @command()
  addTableRowBefore(): CommandFunction {
    return convertCommand(addRowBefore);
  }

  /**
   * Add a table row after the current selection.
   */
  @command()
  addTableRowAfter(): CommandFunction {
    return convertCommand(addRowAfter);
  }
}

export class TableRowExtension extends BaseTableRowExtension {
  get name() {
    return 'tableRow' as const;
  }

  createNodeSpec(extra: ApplySchemaAttributes, override: NodeSpecOverride): TableSchemaSpec {
    const spec = super.createNodeSpec(extra, override);
    spec.content = '(tableCell | tableHeaderCell | tableControllerCell)*';
    spec.toDOM = (node) => {
      return ['tr', extra.dom(node), 0];
    };
    spec.allowGapCursor = false;
    return spec;
  }

  /**
   * Automatically create the `TableCellExtension`,`TableHeaderCellExtension`
   * and `TableControllerCellExtension`. This is placed here so that this
   * extension can be tested independently from the `TableExtension`.
   */
  createExtensions() {
    return [
      new TableCellExtension({ priority: ExtensionPriority.Low }),
      new TableHeaderCellExtension({ priority: ExtensionPriority.Low }),
    ];
  }
}

export class TableHeaderCellExtension extends BaseTableHeaderCellExtension {
  get name() {
    return 'tableHeaderCell' as const;
  }

  createNodeSpec(extra: ApplySchemaAttributes, override: NodeSpecOverride): TableSchemaSpec {
    const spec = super.createNodeSpec(extra, override);
    spec.attrs = {
      ...spec.attrs,
    };
    spec.allowGapCursor = false;

    return spec;
  }

  createExtensions() {
    return [new TableControllerCellExtension({ priority: ExtensionPriority.Low })];
  }
}

export class TableCellExtension extends BaseTableCellExtension {
  get name() {
    return 'tableCell' as const;
  }

  createNodeSpec(extra: ApplySchemaAttributes, override: NodeSpecOverride): TableSchemaSpec {
    const spec = super.createNodeSpec(extra, override);
    spec.allowGapCursor = false;
    return spec;
  }
}

export interface ReactTableControllerCellAttrs {
  colspan: number;
  rowspan: number;
  colwidth: null | number;
  background: null | string;
}

export class TableControllerCellExtension extends NodeExtension {
  get name() {
    return 'tableControllerCell' as const;
  }

  createNodeSpec(extra: ApplySchemaAttributes): TableSchemaSpec {
    const cellAttrs = {
      ...extra.defaults(),

      colspan: { default: 1 },
      rowspan: { default: 1 },
      colwidth: { default: null },
      background: { default: null },
    };

    return {
      atom: true,
      isolating: true,
      content: 'block*',
      attrs: cellAttrs,
      tableRole: 'header_cell',
      toDOM() {
        return ['th', 0];
      },
      allowGapCursor: false,
    };
  }

  createNodeViews(): NodeViewMethod {
    return (node: ProsemirrorNode, view: EditorView, getPos: boolean | (() => number)) => {
      return new TableControllerCellView(node, view, getPos as () => number);
    };
  }

  createExtensions() {
    return [];
  }
}
