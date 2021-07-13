import { EditorSchema, EditorView, NodeView, range, throttle, Transaction } from '@remirror/core';
import { Node as ProsemirrorNode } from '@remirror/pm/model';
import { TableMap, updateColumnsOnResize } from '@remirror/pm/tables';
import { Decoration } from '@remirror/pm/view';
import { ExtensionTablesTheme } from '@remirror/theme';

import TableInsertButton, { shouldHideInsertButton } from '../components/table-insert-button';
import { ReactTableNodeAttrs } from '../table-extensions';
import { h } from '../utils/dom';
import { setNodeAttrs } from '../utils/prosemirror';

export class TableView<Schema extends EditorSchema = EditorSchema> implements NodeView<Schema> {
  readonly root: HTMLElement;
  readonly table: HTMLElement;
  readonly colgroup: HTMLElement;
  readonly tbody: HTMLElement;
  readonly insertButtonWrapper: HTMLElement;

  private readonly handleMouseMove: (e: MouseEvent) => void;
  private showInsertButton: boolean;
  private removeInsertButton?: (tr: Transaction) => Transaction;

  map: TableMap;

  get dom(): HTMLElement {
    return this.root;
  }

  get contentDOM(): HTMLElement {
    return this.tbody;
  }

  constructor(
    public node: ProsemirrorNode,
    public cellMinWidth: number,
    public decorations: Decoration[],
    public view: EditorView,
    public getPos: () => number,
  ) {
    // console.debug('[TableView] constructor');

    this.map = TableMap.get(this.node);

    this.tbody = h('tbody', { className: ExtensionTablesTheme.TABLE_TBODY_WITH_CONTROLLERS });
    this.colgroup = h(
      'colgroup',
      { className: ExtensionTablesTheme.TABLE_COLGROUP },
      ...range(this.map.width).map(() => h('col')),
    );
    this.table = h('table', { className: ExtensionTablesTheme.TABLE }, this.colgroup, this.tbody);
    this.insertButtonWrapper = h('div');
    this.root = h('div', null, this.table, this.insertButtonWrapper);

    this.render();

    this.showInsertButton = false;
    this.handleMouseMove = throttle(100, (e: MouseEvent) => {
      if (this.showInsertButton) {
        const attrs = this.attrs().insertButtonAttrs;

        if (attrs && shouldHideInsertButton(attrs, e)) {
          this.showInsertButton = false;
          replaceChildren(this.insertButtonWrapper, []);

          if (this.removeInsertButton) {
            this.view.dispatch(this.removeInsertButton(this.view.state.tr));
          }
        }
      }
    });

    document.addEventListener('mousemove', this.handleMouseMove);
  }

  update(node: ProsemirrorNode, decorations: Decoration[]): boolean {
    // console.debug(`[TableView] update`);

    if (node.type !== this.node.type) {
      return false;
    }

    this.decorations = decorations;
    this.node = node;
    this.map = TableMap.get(this.node);

    this.render();

    return true;
  }

  private render() {
    this.renderTable();

    if (!this.attrs().isControllersInjected) {
      return;
    }

    this.renderInsertButton();
  }

  private renderTable() {
    if (this.colgroup.children.length !== this.map.width) {
      const cols = range(this.map.width).map(() => h('col'));
      replaceChildren(this.colgroup, cols);
    }

    const className = [
      ExtensionTablesTheme.TABLE,

      // Hide the table before controllers injected
      this.attrs().isControllersInjected
        ? ExtensionTablesTheme.TABLE_WITH_CONTROLLERS
        : ExtensionTablesTheme.TABLE_WAITTING_CONTROLLERS,
    ].join(' ');

    if (this.table.className !== className) {
      this.table.className = className;
    }

    updateColumnsOnResize(this.node, this.colgroup, this.table, this.cellMinWidth);
  }

  private renderInsertButton() {
    const attrs = this.attrs().insertButtonAttrs;

    if (attrs) {
      const tableRect = {
        map: this.map,
        table: this.node,
        tableStart: this.getPos() + 1,

        // The following properties are not actually used
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
      };
      this.removeInsertButton = (tr: Transaction): Transaction => {
        // Remove insertButtonAttrs from tableNode so that the TableInsertButton won't keep at the origin position.
        const attrsPatch: Partial<ReactTableNodeAttrs> = { insertButtonAttrs: null };
        return setNodeAttrs(tr, tableRect.tableStart - 1, attrsPatch);
      };
      const button = TableInsertButton({
        view: this.view,
        attrs,
        tableRect,
        removeInsertButton: this.removeInsertButton,
      });
      replaceChildren(this.insertButtonWrapper, [button]);
      this.showInsertButton = true;
    } else {
      replaceChildren(this.insertButtonWrapper, []);
      this.showInsertButton = false;
    }
  }

  private attrs() {
    return this.node.attrs as ReactTableNodeAttrs;
  }

  ignoreMutation(): boolean {
    return true;
  }

  destroy(): void {
    // console.debug('[TableView] destroy');

    document.removeEventListener('mousemove', this.handleMouseMove);
  }
}

// TODO: this function's performance should be very bad. Maybe we should use some kind of DOM-diff algorithm.
export function replaceChildren(parent: HTMLElement, children: HTMLElement[]): void {
  while (parent.firstChild) {
    parent.firstChild.remove();
  }

  for (const child of children) {
    parent.append(child);
  }
}
