import {
  ApplySchemaAttributes,
  command,
  CommandFunction,
  CommandFunctionProps,
  convertCommand,
  CreateExtensionPlugin,
  EditorState,
  EditorView,
  extension,
  ExtensionPriority,
  ExtensionTag,
  findParentNodeOfType,
  Helper,
  helper,
  isElementDomNode,
  NodeExtension,
  NodeSpecOverride,
  nonChainable,
  NonChainableCommandFunction,
  OnSetOptionsProps,
  ProsemirrorPlugin,
  StateUpdateLifecycleProps,
} from '@remirror/core';
import { TextSelection } from '@remirror/pm/state';
import {
  addColumnAfter,
  addColumnBefore,
  addRowAfter,
  addRowBefore,
  CellSelection,
  columnResizing,
  deleteColumn,
  deleteRow,
  deleteTable,
  fixTables,
  fixTablesKey,
  isCellSelection,
  mergeCells,
  setCellAttr,
  splitCell,
  tableEditing,
  // @ts-expect-error TableView is exported
  TableView,
  toggleHeaderCell,
  toggleHeaderColumn,
  toggleHeaderRow,
  updateColumnsOnResize,
} from '@remirror/pm/tables';

import {
  createTable,
  CreateTableCommand,
  createTableNodeSchema,
  createTableOptions,
  findCellClosestToPos,
  TableSchemaSpec,
} from './table-utils';

export interface TableResizableOptions {
  handleWidth?: number;
  cellMinWidth?: number;
}

export interface TableOptions {
  /**
   * When `true` the table will be resizable.
   *
   * @defaultValue true
   */
  resizable?: boolean;

  /**
   * The options passed to the column resizing plugin
   */
  resizeableOptions?: TableResizableOptions;
}

let tablesEnabled = false;

@extension<TableOptions>({
  defaultOptions: {
    resizable: true,
    resizeableOptions: {},
  },
  defaultPriority: ExtensionPriority.Default,
})
export class TableExtension extends NodeExtension<TableOptions> {
  private lastGoodState?: EditorState = undefined;

  get name() {
    return 'table' as const;
  }

  createTags() {
    return [ExtensionTag.Block];
  }

  /**
   * The last known good state that didn't need fixing. This helps make the fix
   * command more effective.
   */

  createNodeSpec(extra: ApplySchemaAttributes, override: NodeSpecOverride): TableSchemaSpec {
    return createTableNodeSchema(extra, override).table;
  }

  /**
   * Create the table extensions. Set the priority to low so that they appear
   * lower down in the node list.
   */
  createExtensions() {
    return [new TableRowExtension({ priority: ExtensionPriority.Low })];
  }

  onStateUpdate(props: StateUpdateLifecycleProps): void {
    const { tr, state } = props;

    if (tr?.getMeta(fixTablesKey)?.fixTables) {
      this.lastGoodState = state;
    }
  }

  onView(_: EditorView): void {
    if (this.store.helpers.isViewEditable() === false) {
      this.store.updateExtensionPlugins(this);
    }
  }

  /**
   * Add the table plugins to the editor.
   */
  createExternalPlugins(): ProsemirrorPlugin[] {
    const plugins: ProsemirrorPlugin[] = [];

    if (this.store.isMounted() && this.store.helpers.isViewEditable() === false) {
      return plugins;
    }

    const { resizable, resizeableOptions } = this.options;

    if (resizable) {
      // Add first to avoid highlighting cells while resizing
      plugins.push(columnResizing(resizeableOptions));
    }

    plugins.push(tableEditing());

    return plugins;
  }

  createPlugin(): CreateExtensionPlugin {
    const { resizable, resizeableOptions } = this.options;

    if (!resizable) {
      return {};
    }

    if (!this.store.isMounted() || this.store.helpers.isViewEditable()) {
      // If the view is editable, we should be using the external columnResizing plugin above
      return {};
    }

    /**
     * If the view is not editable, use the updateColumnsOnResize method to ensure col widths are applied
     */

    const { cellMinWidth = 25 } = resizeableOptions;

    return {
      props: {
        nodeViews: {
          table(node, view, getPos) {
            const dom = view.nodeDOM(getPos());

            if (!isElementDomNode(dom)) {
              return;
            }

            updateColumnsOnResize(node, dom.firstChild as Element, dom, cellMinWidth);

            return new TableView(node, cellMinWidth, view);
          },
        },
      },
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

      const offset = tr.selection.anchor + 1;
      const nodes = createTable({ schema: state.schema, ...options });

      dispatch?.(
        tr
          .replaceSelectionWith(nodes)
          .scrollIntoView()
          .setSelection(TextSelection.near(tr.doc.resolve(offset))),
      );

      return true;
    };
  }

  /**
   * Delete the table.
   */
  @command()
  deleteTable(): CommandFunction {
    return convertCommand(deleteTable);
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
   * Remove selected column from the table.
   */
  @command()
  deleteTableColumn(): CommandFunction {
    return convertCommand(deleteColumn);
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

  /**
   * Delete the table row at the current selection.
   */
  @command()
  deleteTableRow(): CommandFunction {
    return convertCommand(deleteRow);
  }

  /**
   * Toggles between merging cells.
   */
  @command()
  toggleTableCellMerge(): CommandFunction {
    return toggleMergeCellCommand;
  }

  /**
   * Merge the table cells.
   */
  @command()
  mergeTableCells(): CommandFunction {
    return convertCommand(mergeCells);
  }

  /**
   * Split the merged cells into individual cells.
   */
  @command()
  splitTableCell(): CommandFunction {
    return convertCommand(splitCell);
  }

  /**
   * Toggles a column as the header column.
   */
  @command()
  toggleTableHeaderColumn(): CommandFunction {
    return convertCommand(toggleHeaderColumn);
  }

  /**
   * Toggles a row as a table header row.
   */
  @command()
  toggleTableHeaderRow(): CommandFunction {
    return convertCommand(toggleHeaderRow);
  }

  /**
   * Toggle a cell as a table header cell.
   */
  @command()
  toggleTableHeaderCell(): CommandFunction {
    return convertCommand(toggleHeaderCell);
  }

  /**
   * Set the attribute for a table cell.
   */
  @command()
  setTableCellAttribute(name: string, value: unknown): CommandFunction {
    return convertCommand(setCellAttr(name, value));
  }

  /**
   * Fix all tables within the document.
   *
   * This is a **non-chainable** command.
   */
  @command({ disableChaining: true })
  fixTables(): NonChainableCommandFunction {
    return nonChainable(fixTablesCommand(this.lastGoodState));
  }

  /**
   * Enable table usage within the editor. This depends on the browser that
   * is being used.
   */
  @helper()
  enableTableSupport(): Helper<void> {
    if (!tablesEnabled) {
      document.execCommand('enableObjectResizing', false, 'false');
      document.execCommand('enableInlineTableEditing', false, 'false');
      tablesEnabled = true;
    }
  }

  /**
   * Update the background of one cell or multiple cells by passing a color
   * string. You can also remove the color by passing a `null`.
   */
  @command()
  setTableCellBackground(background: string | null): CommandFunction {
    return (props) => {
      let { tr } = props;
      const { dispatch } = props;
      const { selection } = tr;

      if (selection instanceof CellSelection) {
        selection.forEachCell((cellNode, pos) => {
          tr = tr.setNodeMarkup(pos, undefined, { ...cellNode.attrs, background });
        });
        dispatch?.(tr);
        return true;
      }

      const found = findParentNodeOfType({ selection, types: ['tableCell', 'tableHeaderCell'] });

      if (found) {
        dispatch?.(tr.setNodeMarkup(found.pos, undefined, { ...found.node.attrs, background }));
        return true;
      }

      return false;
    };
  }

  @command()
  selectParentCell(): CommandFunction {
    return ({ dispatch, tr }) => {
      const cell = findCellClosestToPos(tr.selection.$from);

      if (!cell) {
        return false;
      }

      dispatch?.(tr.setSelection(CellSelection.create(tr.doc, cell.pos)));
      return true;
    };
  }

  @command()
  expandCellSelection(type: 'column' | 'row' | 'all' = 'all'): CommandFunction {
    return ({ dispatch, tr }) => {
      if (!isCellSelection(tr.selection)) {
        return false;
      }

      if (type !== 'row') {
        const { $anchorCell, $headCell } = tr.selection;
        tr.setSelection(CellSelection.colSelection($anchorCell, $headCell));
      }

      if (type !== 'column') {
        const { $anchorCell, $headCell } = tr.selection;
        tr.setSelection(CellSelection.rowSelection($anchorCell, $headCell));
      }

      dispatch?.(tr);
      return true;
    };
  }

  /**
   * This managers the updates of the collaboration provider.
   */
  protected onSetOptions(props: OnSetOptionsProps<TableOptions>): void {
    const { changes } = props;

    // TODO move this into a new method in `plugins-extension`.
    if (changes.resizable.changed) {
      this.store.updateExtensionPlugins(this);
    }
  }
}

/**
 * The extension for a table row node.
 */
@extension({ defaultPriority: ExtensionPriority.Low })
export class TableRowExtension extends NodeExtension {
  get name() {
    return 'tableRow' as const;
  }

  /**
   * Automatically create the `TableCellExtension` and
   * `TableHeaderCellExtension`. This is placed here so that this extension can
   * be tested independently from the `TableExtension`.
   */
  createExtensions(): Array<
    TableCellExtension | TableHeaderCellExtension | TableControllerCellExtension
  > {
    return [
      new TableCellExtension({ priority: ExtensionPriority.Low }),
      new TableHeaderCellExtension({ priority: ExtensionPriority.Low }),
    ];
  }

  createNodeSpec(extra: ApplySchemaAttributes, override: NodeSpecOverride): TableSchemaSpec {
    return createTableNodeSchema(extra, override).tableRow;
  }
}

/**
 * The extension for a table cell node.
 */
@extension({ defaultPriority: ExtensionPriority.Low })
export class TableCellExtension extends NodeExtension {
  get name() {
    return 'tableCell' as const;
  }

  createNodeSpec(extra: ApplySchemaAttributes, override: NodeSpecOverride): TableSchemaSpec {
    return createTableNodeSchema(extra, override).tableCell;
  }
}

/**
 * The extension for the table header node.
 */
@extension({ defaultPriority: ExtensionPriority.Low })
export class TableHeaderCellExtension extends NodeExtension {
  get name() {
    return 'tableHeaderCell' as const;
  }

  createNodeSpec(extra: ApplySchemaAttributes, override: NodeSpecOverride): TableSchemaSpec {
    return createTableNodeSchema(extra, override).tableHeaderCell;
  }
}

/**
 * This is not used in the basic table extension, but is required for this React Tables extension that extends this
 */
@extension({ defaultPriority: ExtensionPriority.Low })
export class TableControllerCellExtension extends NodeExtension {
  get name() {
    return 'tableControllerCell' as const;
  }

  createNodeSpec(_: ApplySchemaAttributes, __: NodeSpecOverride): TableSchemaSpec {
    return {
      tableRole: 'header_cell',
    };
  }
}

/**
 * The command for fixing the tables.
 */
function fixTablesCommand(lastGoodState?: EditorState): CommandFunction {
  return ({ state, dispatch }) => {
    const tr = fixTables(state, lastGoodState);

    if (!tr) {
      return false;
    }

    if (dispatch) {
      dispatch(tr);
    }

    return true;
  };
}

function toggleMergeCellCommand({ state, dispatch }: CommandFunctionProps) {
  if (mergeCells(state, dispatch)) {
    return false;
  }

  return splitCell(state, dispatch);
}

declare global {
  namespace Remirror {
    interface AllExtensions {
      table: TableExtension;
    }
  }
}
