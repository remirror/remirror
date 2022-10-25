import React, { CSSProperties, MouseEventHandler, useCallback } from 'react';
import type { CommandFunction, FindProsemirrorNodeResult } from '@remirror/core';
import { cx, findParentNodeOfType, isElementDomNode, last, mergeDOMRects } from '@remirror/core';
import {
  defaultAbsolutePosition,
  hasStateChanged,
  isPositionVisible,
  Positioner,
} from '@remirror/extension-positioner';
import { TableMap } from '@remirror/pm/tables';
import { Icon, PositionerPortal } from '@remirror/react-components';
import { useCommands } from '@remirror/react-core';
import type { UsePositionerReturn } from '@remirror/react-hooks';
import { usePositioner } from '@remirror/react-hooks';
import { ExtensionTablesTheme } from '@remirror/theme';

import { resetControllerPluginMeta, setControllerPluginMeta } from '../table-plugins';

interface DeleteTableButtonPositionerData {
  tableResult: FindProsemirrorNodeResult;
}

const highlightTable: CommandFunction = ({ tr, dispatch }) => {
  const node = findParentNodeOfType({
    types: 'table',
    selection: tr.selection,
  });

  if (!node) {
    return false;
  }

  dispatch?.(setControllerPluginMeta(tr, { preselectTable: true, predelete: true }));
  return true;
};

const unhighlightTable: CommandFunction = ({ tr, dispatch }) => {
  dispatch?.(resetControllerPluginMeta(tr));
  return true;
};

function createDeleteTableButtonPositioner(): Positioner<DeleteTableButtonPositionerData> {
  return Positioner.create<DeleteTableButtonPositionerData>({
    hasChanged: hasStateChanged,

    getActive(props) {
      const { selection } = props.state;
      const tableResult = findParentNodeOfType({ types: 'table', selection });

      if (tableResult) {
        const positionerData: DeleteTableButtonPositionerData = {
          tableResult,
        };
        return [positionerData];
      }

      return Positioner.EMPTY;
    },

    getPosition(props) {
      const { view, data } = props;

      const { node, pos } = data.tableResult;
      const map = TableMap.get(node);

      const firstCellDOM = view.nodeDOM(pos + map.map[0] + 1);
      const lastCellDOM = view.nodeDOM(pos + last(map.map) + 1);

      if (
        !firstCellDOM ||
        !lastCellDOM ||
        !isElementDomNode(firstCellDOM) ||
        !isElementDomNode(lastCellDOM)
      ) {
        return defaultAbsolutePosition;
      }

      const rect = mergeDOMRects(
        firstCellDOM.getBoundingClientRect(),
        lastCellDOM.getBoundingClientRect(),
      );
      const editorRect = view.dom.getBoundingClientRect();

      // The top and left relative to the parent `editorRect`.
      const left = view.dom.scrollLeft + rect.left - editorRect.left;
      const top = view.dom.scrollTop + rect.top - editorRect.top;
      const visible = isPositionVisible(rect, view.dom);

      const margin = 16;

      return {
        rect,
        visible,
        height: 0,
        width: 0,
        x: left + rect.width / 2,
        y: top + rect.height + margin,
      };
    },
  });
}

export interface TableDeleteInnerButtonProps {
  /**
   * The position of the button
   */
  position: UsePositionerReturn;

  /**
   * The action when the button is pressed.
   */
  onClick: MouseEventHandler;

  /**
   * The action when the mouse is pressed on the button.
   */
  onMouseDown: MouseEventHandler;

  /**
   * The action when the mouse is over the button.
   */
  onMouseEnter: MouseEventHandler;

  /**
   * The action when the mouse level the button.
   */
  onMouseLeave: MouseEventHandler;
}

export const TableDeleteInnerButton: React.FC<TableDeleteInnerButtonProps> = ({
  position,
  onClick,
  onMouseDown,
  onMouseEnter,
  onMouseLeave,
}) => {
  const size = 18;

  return (
    <button
      ref={position.ref}
      onClick={onClick}
      onMouseDown={onMouseDown}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={
        {
          '--remirror-table-delete-button-y': `${position.y}px`,
          '--remirror-table-delete-button-x': `${position.x}px`,
        } as CSSProperties
      }
      className={cx(
        ExtensionTablesTheme.TABLE_DELETE_INNER_BUTTON,
        ExtensionTablesTheme.TABLE_DELETE_TABLE_INNER_BUTTON,
      )}
    >
      <Icon name='deleteBinLine' size={size} color={'#ffffff'} />
    </button>
  );
};

export interface TableDeleteButtonProps {
  Component?: React.ComponentType<TableDeleteInnerButtonProps>;
}

const deleteButtonPositioner = createDeleteTableButtonPositioner();

function usePosition() {
  const position = usePositioner(deleteButtonPositioner, []);
  return position;
}

export const TableDeleteButton: React.FC<TableDeleteButtonProps> = ({ Component }) => {
  const position = usePosition();
  const { customDispatch, deleteTable } = useCommands();

  const handleMouseDown: MouseEventHandler = useCallback((e) => {
    e.preventDefault();
  }, []);

  const handleMouseEnter: MouseEventHandler = useCallback(() => {
    customDispatch(highlightTable);
  }, [customDispatch]);

  const handleMouseLeave: MouseEventHandler = useCallback(() => {
    customDispatch(unhighlightTable);
  }, [customDispatch]);

  const handleClick = useCallback(() => {
    deleteTable();
  }, [deleteTable]);

  Component = Component ?? TableDeleteInnerButton;

  return (
    <PositionerPortal>
      <Component
        position={position}
        onClick={handleClick}
        onMouseDown={handleMouseDown}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      />
    </PositionerPortal>
  );
};
