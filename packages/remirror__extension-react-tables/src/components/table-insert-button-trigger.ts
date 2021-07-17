import { EditorView } from '@remirror/pm';
import { ExtensionTablesTheme } from '@remirror/theme';

import { borderWidth } from '../const';
import { getCellAxisByMouseEvent } from '../utils/controller';
import { getRelativeCoord, h } from '../utils/dom';
import { setNodeAttrs } from '../utils/prosemirror';
import { CellAxis, FindTable } from '../utils/types';
import { InsertButtonAttrs } from './table-insert-button';

enum TriggerAreaType {
  ADD_COLUMN_BEFORE = 1,
  ADD_COLUMN_AFTER = 2,
  ADD_ROW_BEFORE = 3,
  ADD_ROW_AFTER = 4,
}

function buildInsertButtonAttrs(
  type: TriggerAreaType,
  triggerRect: DOMRect,
  editorDom: Element,
  cellAxis: CellAxis,
): InsertButtonAttrs {
  const { row, col } = cellAxis;
  const relativeCoord = getRelativeCoord(triggerRect, editorDom);

  switch (type) {
    case TriggerAreaType.ADD_COLUMN_BEFORE:
      return {
        triggerRect,
        x: relativeCoord.x - borderWidth,
        y: relativeCoord.y + 12,
        row: -1,
        col: col,
      };
    case TriggerAreaType.ADD_COLUMN_AFTER:
      return {
        triggerRect,
        x: relativeCoord.x + triggerRect.width,
        y: relativeCoord.y + 12,
        row: -1,
        col: col + 1,
      };
    case TriggerAreaType.ADD_ROW_BEFORE:
      return {
        triggerRect,
        x: relativeCoord.x + 12,
        y: relativeCoord.y + 5 - borderWidth,
        row: row,
        col: -1,
      };
    default:
      return {
        triggerRect,
        x: relativeCoord.x + 12,
        y: relativeCoord.y + 5 + triggerRect.height,
        row: row + 1,
        col: -1,
      };
  }
}

function showButton(
  trigger: HTMLElement,
  findTable: FindTable,
  type: TriggerAreaType,
  axis: CellAxis,
  view: EditorView,
): void {
  const triggerRect = trigger?.getBoundingClientRect();

  if (!triggerRect || !(triggerRect.width || triggerRect.height)) {
    return;
  }

  const tableResult = findTable();

  if (!tableResult) {
    return;
  }

  const insertButtonAttrs = buildInsertButtonAttrs(type, triggerRect, view.dom, axis);
  view.dispatch(setNodeAttrs(view.state.tr, tableResult.pos, { insertButtonAttrs }));
}

const TriggerArea = ({
  isTopLeft,
  view,
  findTable,
}: {
  isTopLeft: boolean; // is the top half part (in the row controller case) or left half part (in the column controller case)
  view: EditorView;
  findTable: FindTable;
}) => {
  const trigger = h('div', {
    className: ExtensionTablesTheme.TABLE_CONTROLLER_TRIGGER_AREA,
    onMouseEnter: (event) => {
      const axis = getCellAxisByMouseEvent(view, event);

      if (axis) {
        let type: TriggerAreaType | undefined;

        if (axis.row > 0) {
          type = isTopLeft ? TriggerAreaType.ADD_ROW_BEFORE : TriggerAreaType.ADD_ROW_AFTER;
        } else if (axis.col > 0) {
          type = isTopLeft ? TriggerAreaType.ADD_COLUMN_BEFORE : TriggerAreaType.ADD_COLUMN_AFTER;
        }

        if (type) {
          showButton(trigger, findTable, type, axis, view);
        }
      }
    },
  });

  return trigger;
};

const TableInsertButtonTrigger = ({
  view,
  findTable,
}: {
  view: EditorView;
  findTable: FindTable;
}): HTMLElement[] => {
  return [
    TriggerArea({ view, findTable, isTopLeft: true }),
    TriggerArea({ view, findTable, isTopLeft: false }),
  ];
};

export default TableInsertButtonTrigger;
