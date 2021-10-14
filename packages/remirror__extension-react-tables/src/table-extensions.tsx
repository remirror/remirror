import {
  ApplySchemaAttributes,
  command,
  CommandFunction,
  convertCommand,
  EditorView,
  ErrorConstant,
  ExtensionPriority,
  findParentNodeOfType,
  invariant,
  NodeExtension,
  NodeSpecOverride,
  NodeViewMethod,
  ProsemirrorNode,
  Selection,
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
import { EditorState, TextSelection } from '@remirror/pm/state';
import { isCellSelection, Rect, TableMap } from '@remirror/pm/tables';
import { Decoration, DecorationSet } from '@remirror/pm/view';

import { addColumnAfter, addColumnBefore, addRowAfter, addRowBefore } from './react-table-commands';
import { TableControllerCellView } from './views/table-controller-cell-view';

export type ReactTableNodeAttrs<T extends Record<string, any> = Record<never, never>> = T & {
  // isControllersInjected: boolean;
  // // if and only if `insertButtonAttrs` exists, InsertButton will show.
  // // TODO: move insertButtonAttrs to ControllerPlugin
  // insertButtonAttrs: InsertButtonAttrs | null;
};

export class TableExtension extends BaseTableExtension {
  get name() {
    return 'table' as const;
  }

  // createNodeViews(): NodeViewMethod {
  //   return (
  //     node: ProsemirrorNode,
  //     view: EditorView,
  //     getPos: boolean | (() => number),
  //     decorations: Decoration[],
  //   ) => {
  //     return new TableView(node, 10, decorations, view, getPos as () => number);
  //   };
  // }

  /**
   * Add the table plugins to the editor.
   */
  // createExternalPlugins(): ProsemirrorPlugin[] {
  //   const plugins = [tableEditing(), createTableControllerPlugin()];

  //   if (this.options.resizable) {
  //     plugins.push(columnResizing({ firstResizableColumn: 1 }));
  //   }

  //   return plugins;
  // }

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
      // const controlledTable = injectControllers({
      //   schema,
      //   getMap: () => TableMap.get(table),
      //   table,
      // });

      dispatch?.(
        tr
          .replaceSelectionWith(table)
          .scrollIntoView()
          .setSelection(TextSelection.near(tr.doc.resolve(offset))),
      );

      return true;
    };
  }

  createDecorations(state: EditorState): DecorationSet {
    const { doc, selection } = state;
    const decorations: Decoration[] = [];
    {
      const cells = getCellsInColumn(0)(selection);

      if (cells) {
        cells.forEach(({ pos }, index) => {
          if (index === 0) {
            decorations.push(
              Decoration.widget(pos + 1, () => {
                let className = 'grip-table';
                const selected = isTableSelected(selection);

                if (selected) {
                  className += ' selected';
                }

                const grip = document.createElement('a');
                grip.className = className;
                grip.addEventListener('mousedown', (event) => {
                  event.preventDefault();
                  // this.options.onSelectTable(state);
                  console.log('table is selected');
                });
                return grip;
              }),
            );
          }

          decorations.push(
            Decoration.widget(pos + 1, () => {
              const rowSelected = isRowSelected(index)(selection);

              let className = 'grip-row';

              if (rowSelected) {
                className += ' selected';
              }

              if (index === 0) {
                className += ' first';
              }

              if (index === cells.length - 1) {
                className += ' last';
              }

              const grip = document.createElement('a');
              grip.className = className;
              grip.addEventListener('mousedown', (event) => {
                event.preventDefault();
                // this.options.onSelectRow(index, state);
                console.log('row is selected');
              });
              return grip;
            }),
          );
        });
      }
    }
    {
      const cells = getCellsInRow(0)(selection);

      if (cells) {
        cells.forEach(({ pos }, index) => {
          decorations.push(
            Decoration.widget(pos + 1, () => {
              const colSelected = isColumnSelected(index)(selection);
              let className = 'grip-column';

              if (colSelected) {
                className += ' selected';
              }

              if (index === 0) {
                className += ' first';
              } else if (index === cells.length - 1) {
                className += ' last';
              }

              const grip = document.createElement('a');
              grip.className = className;
              grip.addEventListener('mousedown', (event) => {
                event.preventDefault();
                // this.options.onSelectColumn(index, state);
              });
              return grip;
            }),
          );
        });
      }
    }

    return DecorationSet.create(doc, decorations);
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
    spec.content = '(tableCell | tableHeaderCell)*';
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

function getCellsInColumn(columnIndex: number | number[]) {
  return (selection: Selection) => {
    const table = findParentNodeOfType({ selection, types: 'table' });

    if (table) {
      const map = TableMap.get(table.node);
      const indexes = Array.isArray(columnIndex) ? columnIndex : [columnIndex];
      const cells: Array<{ pos: number; start: number; node: ProsemirrorNode }> = [];

      for (const index of indexes) {
        if (index >= 0 && index <= map.width - 1) {
          const cellPositions = map.cellsInRect({
            left: index,
            right: index + 1,
            top: 0,
            bottom: map.height,
          });

          for (const cellPos of cellPositions) {
            const node = table.node.nodeAt(cellPos);
            const pos = cellPos + table.start;
            invariant(node, {
              code: ErrorConstant.INTERNAL,
              message: `unable to find a table cell node at position ${pos}`,
            });
            cells.push({ pos, start: pos + 1, node });
          }
        }
      }

      return cells;
    }

    return [];
  };
}

function getCellsInRow(rowIndex: number | number[]) {
  return function (selection: Selection) {
    const table = findParentNodeOfType({ selection, types: 'table' });

    if (table) {
      const map = TableMap.get(table.node);
      const indexes = Array.isArray(rowIndex) ? rowIndex : [rowIndex];
      const cells: Array<{ pos: number; start: number; node: ProsemirrorNode }> = [];

      for (const index of indexes) {
        if (index >= 0 && index <= map.height - 1) {
          const cellPositions = map.cellsInRect({
            left: 0,
            right: map.width,
            top: index,
            bottom: index + 1,
          });

          for (const cellPos of cellPositions) {
            const node = table.node.nodeAt(cellPos);
            const pos = cellPos + table.start;
            invariant(node, {
              code: ErrorConstant.INTERNAL,
              message: `unable to find a table cell node at position ${pos}`,
            });
            cells.push({ pos, start: pos + 1, node });
          }
        }
      }

      return cells;
    }

    return [];
  };
}

// Checks if entire row at index `rowIndex` is selected.
//
// ```javascript
// const className = isRowSelected(i)(selection) ? 'selected' : '';
// ```
function isRowSelected(rowIndex: number) {
  return function (selection: Selection) {
    if (isCellSelection(selection)) {
      const map = TableMap.get(selection.$anchorCell.node(-1));
      return isRectSelected({
        left: 0,
        right: map.width,
        top: rowIndex,
        bottom: rowIndex + 1,
      })(selection);
    }

    return false;
  };
}

// Checks if a given CellSelection rect is selected
function isRectSelected(rect: Rect) {
  return function (selection: Selection) {
    if (!isCellSelection(selection)) {
      return false;
    }

    const map = TableMap.get(selection.$anchorCell.node(-1));
    const start = selection.$anchorCell.start(-1);
    const cells = map.cellsInRect(rect);
    const selectedCells = map.cellsInRect(
      map.rectBetween(selection.$anchorCell.pos - start, selection.$headCell.pos - start),
    );

    for (const cell of cells) {
      if (!selectedCells.includes(cell)) {
        return false;
      }
    }

    return true;
  };
}

function isTableSelected(selection: Selection) {
  if (isCellSelection(selection)) {
    const map = TableMap.get(selection.$anchorCell.node(-1));
    return isRectSelected({
      left: 0,
      right: map.width,
      top: 0,
      bottom: map.height,
    })(selection);
  }

  return false;
}

function isColumnSelected(columnIndex: number) {
  return function (selection: Selection) {
    if (isCellSelection(selection)) {
      const map = TableMap.get(selection.$anchorCell.node(-1));
      return isRectSelected({
        left: columnIndex,
        right: columnIndex + 1,
        top: 0,
        bottom: map.height,
      })(selection);
    }

    return false;
  };
}
