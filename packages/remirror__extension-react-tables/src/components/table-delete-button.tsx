import React, { CSSProperties, MouseEventHandler, useCallback } from 'react';
import type { EditorView, FindProsemirrorNodeResult } from '@remirror/core';
import { findParentNodeOfType, isElementDomNode } from '@remirror/core';
import {
  defaultAbsolutePosition,
  hasStateChanged,
  isPositionVisible,
  Positioner,
} from '@remirror/extension-positioner';
import { deleteColumn, deleteRow, isCellSelection, TableMap } from '@remirror/pm/tables';
import { PositionerPortal } from '@remirror/react-components';
import { CloseFillIcon } from '@remirror/react-components/all-icons';
import { useRemirrorContext } from '@remirror/react-core';
import type { UsePositionerReturn } from '@remirror/react-hooks';
import { usePositioner } from '@remirror/react-hooks';
import { ExtensionTablesTheme } from '@remirror/theme';

import { CellSelectionType, getCellSelectionType, setPredelete } from '../utils/controller';
import { mergeDOMRects } from '../utils/dom';

interface DeleteButtonPositionerData {
  tableResult: FindProsemirrorNodeResult;
  cellSelectionType: CellSelectionType;
  anchorCellPos: number;
  headCellPos: number;
}

function createDeleteButtonPositioner(): Positioner<DeleteButtonPositionerData> {
  return Positioner.create<DeleteButtonPositionerData>({
    hasChanged: hasStateChanged,

    getActive(props) {
      const { state } = props;
      const { selection } = state;

      if (isCellSelection(selection)) {
        const cellSelectionType = getCellSelectionType(selection);

        if (
          cellSelectionType === CellSelectionType.col ||
          cellSelectionType === CellSelectionType.row
        ) {
          const tableResult = findParentNodeOfType({ types: 'table', selection });

          if (tableResult) {
            const positionerData: DeleteButtonPositionerData = {
              tableResult,
              cellSelectionType,
              anchorCellPos: selection.$anchorCell.pos,
              headCellPos: selection.$headCell.pos,
            };
            return [positionerData];
          }
        }
      }

      return Positioner.EMPTY;
    },

    getPosition(props) {
      const { view, data } = props;

      const anchorCellDOM = view.nodeDOM(data.anchorCellPos);
      const headCellDOM = view.nodeDOM(data.headCellPos);

      if (
        !anchorCellDOM ||
        !headCellDOM ||
        !isElementDomNode(anchorCellDOM) ||
        !isElementDomNode(headCellDOM)
      ) {
        return defaultAbsolutePosition;
      }

      const map = TableMap.get(data.tableResult.node);

      // Don't show the delete button if there is only one row/column (excluded controllers).
      if (data.cellSelectionType === CellSelectionType.col && map.width <= 2) {
        return defaultAbsolutePosition;
      } else if (data.cellSelectionType === CellSelectionType.row && map.height <= 2) {
        return defaultAbsolutePosition;
      }

      const anchorCellRect = anchorCellDOM.getBoundingClientRect();
      const headCellRect = headCellDOM.getBoundingClientRect();
      const rect = mergeDOMRects(anchorCellRect, headCellRect);
      const editorRect = view.dom.getBoundingClientRect();

      // The width and height of the current selected block node.
      const height = rect.height;
      const width = rect.width;

      // The top and left relative to the parent `editorRect`.
      const left = view.dom.scrollLeft + rect.left - editorRect.left;
      const top = view.dom.scrollTop + rect.top - editorRect.top;
      const visible = isPositionVisible(rect, view.dom);

      const margin = 16;

      return data.cellSelectionType === CellSelectionType.row
        ? { rect, visible, height: 0, width: 0, x: left - margin, y: top + height / 2 }
        : { rect, visible, height: 0, width: 0, x: left + width / 2, y: top - margin };
    },
  });
}

export interface TableDeleteRowColumnInnerButtonProps {
  /**
   * The position of the button
   */
  position: UsePositionerReturn;

  /**
   * The action when the button is pressed.
   */
  onClick: MouseEventHandler;

  /**
   * The action when the mouse is over the button.
   */
  onMouseOver: MouseEventHandler;

  /**
   * The action when the mouse level the button.
   */
  onMouseOut: MouseEventHandler;
}

export const TableDeleteRowColumnInnerButton: React.FC<TableDeleteRowColumnInnerButtonProps> = ({
  position,
  onClick,
  onMouseOver,
  onMouseOut,
}) => {
  const size = 18;
  return (
    <div
      ref={position.ref}
      onMouseDown={(e) => {
        // onClick doesn't work. I don't know why.
        onClick(e);
      }}
      onMouseOver={onMouseOver}
      onMouseOut={onMouseOut}
      style={
        {
          '--remirror-table-delete-button-y': `${position.y}px`,
          '--remirror-table-delete-button-x': `${position.x}px`,
        } as CSSProperties
      }
      className={ExtensionTablesTheme.TABLE_DELETE_ROW_COLUMN_INNER_BUTTON}
    >
      <CloseFillIcon size={size} color={'#ffffff'} />
    </div>
  );
};

export interface TableDeleteRowColumnButtonProps {
  Component?: React.ComponentType<TableDeleteRowColumnInnerButtonProps>;
}

const deleteButtonPositioner = createDeleteButtonPositioner();

function usePosition() {
  const position = usePositioner(deleteButtonPositioner, []);
  return position;
}

function useEvents(view: EditorView) {
  const handleClick = useCallback(() => {
    const selection = view.state.selection;

    if (isCellSelection(selection)) {
      const cellSelectionType = getCellSelectionType(selection);

      if (cellSelectionType === CellSelectionType.row) {
        deleteRow(view.state, view.dispatch);
      } else if (cellSelectionType === CellSelectionType.col) {
        deleteColumn(view.state, view.dispatch);
      }
    }
  }, [view]);

  const handleMouseOver = useCallback(() => setPredelete(view, true), [view]);

  const handleMouseOut = useCallback(() => setPredelete(view, false), [view]);

  return { handleClick, handleMouseOver, handleMouseOut };
}

export const TableDeleteRowColumnButton: React.FC<TableDeleteRowColumnButtonProps> = ({
  Component,
}) => {
  const { view } = useRemirrorContext();
  const position = usePosition();
  const { handleClick, handleMouseOver, handleMouseOut } = useEvents(view);

  Component = Component ?? TableDeleteRowColumnInnerButton;

  return (
    <PositionerPortal>
      <Component
        position={position}
        onClick={handleClick}
        onMouseOver={handleMouseOver}
        onMouseOut={handleMouseOut}
      />
    </PositionerPortal>
  );
};
