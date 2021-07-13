import { EditorView, Transaction } from '@remirror/core';
import { addFill } from '@remirror/icons/all';
import { TableRect } from '@remirror/pm/tables';
import { ExtensionTablesTheme } from '@remirror/theme';

import { addColumn, addRow } from '../react-table-commands';
import { h } from '../utils/dom';

export interface InsertButtonAttrs {
  // The center axis (in px) of the TableInsertButton relative to the editor
  x: number;
  y: number;

  // The TableInsertButtonTrigger's boundingClientRect
  triggerRect: DOMRect;

  // If `row` is not `-1`, this button will add a row at this index.
  row: number;
  // If `col` is not `-1`, this button will add a col at this index.
  col: number;
}

export function shouldHideInsertButton(attrs: InsertButtonAttrs, e: MouseEvent): boolean {
  if (attrs.col !== -1) {
    return (
      e.clientX < attrs.triggerRect.left - 400 ||
      e.clientX > attrs.triggerRect.right + 400 ||
      e.clientY < attrs.triggerRect.top - 60 ||
      e.clientY > attrs.triggerRect.bottom
    );
  } else if (attrs.row !== -1) {
    return (
      e.clientX < attrs.triggerRect.left - 40 ||
      e.clientX > attrs.triggerRect.right ||
      e.clientY < attrs.triggerRect.top - 100 ||
      e.clientY > attrs.triggerRect.bottom + 100
    );
  }

  return true;
}

let addFillIconCache: SVGElement | null = null;

// TODO: this part is so ugly.
function AddFillIcon(): SVGElement {
  if (addFillIconCache) {
    return addFillIconCache;
  }

  const xmlns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(xmlns, 'svg');
  svg.setAttribute('xmlns', xmlns);
  svg.setAttribute('viewBox', '0 0 24 24');
  const g = document.createElementNS(xmlns, 'g');

  for (const tree of addFill) {
    const path = document.createElementNS(xmlns, tree.tag);

    for (const [key, value] of Object.entries(tree.attr)) {
      path.setAttribute(key, value);
    }

    g.append(path);
  }

  svg.append(g);
  addFillIconCache = svg;
  return svg;
}

function InnerTableInsertButton(attrs: InsertButtonAttrs): HTMLElement {
  const size = 18;

  return h(
    'div',
    {
      className: `${ExtensionTablesTheme.TABLE_INSERT_BUTTON} ${ExtensionTablesTheme.CONTROLLERS_TOGGLE}`,
      style: {
        top: `${attrs.y - size / 2 - 5}px`,
        left: `${attrs.x - size / 2}px`,
      },
    },
    AddFillIcon(),
  );
}

export interface TableInsertButtonProps {
  view: EditorView;
  tableRect: TableRect;
  attrs: InsertButtonAttrs;
  removeInsertButton: (tr: Transaction) => Transaction;
}

function TableInsertButton({
  view,
  tableRect,
  attrs,
  removeInsertButton,
}: TableInsertButtonProps): HTMLElement {
  const button = InnerTableInsertButton(attrs);

  const insertRolOrColumn = () => {
    let tr = view.state.tr;

    if (attrs.col !== -1) {
      tr = addColumn(tr, tableRect, attrs.col);
    } else if (attrs.row !== -1) {
      tr = addRow(tr, tableRect, attrs.row);
    } else {
      return;
    }

    view.dispatch(removeInsertButton(tr));
  };

  button.addEventListener('mousedown', () => {
    insertRolOrColumn();
  });

  return button;
}

export default TableInsertButton;
