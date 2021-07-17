import React, { useState } from 'react';
import { PositionerPortal } from '@remirror/react-components';
import { useRemirrorContext } from '@remirror/react-core';
import { useEvent, usePositioner } from '@remirror/react-hooks';

import { menuCellPositioner } from '../block-positioner';
import { borderWidth } from '../const';

export interface TableCellMenuComponentProps {
  popupOpen: boolean;
  setPopupOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

type TableCellMenuComponent = React.ComponentType<TableCellMenuComponentProps>;

export interface TableCellMenuProps {
  Component?: TableCellMenuComponent;
}

const DefaultTableCellMenuButton: React.FC<TableCellMenuComponentProps> = ({ setPopupOpen }) => {
  return (
    <button
      onClick={() => {
        setPopupOpen(true);
      }}
      onMouseDown={(event) => {
        // Stop the parent component from listening the onMouseDown event
        event.preventDefault();
        event.stopPropagation();
      }}
      style={{
        position: 'relative',
        right: '0px',
        top: '0px',
        height: '16px',
        width: '16px',
        border: '1px solid blue',
        fontSize: '10px',
        lineHeight: '10px',
        cursor: 'pointer',
      }}
    >
      v
    </button>
  );
};

const DefaultTableCellMenuPopup: React.FC<TableCellMenuComponentProps> = ({
  setPopupOpen,
  popupOpen,
}) => {
  const ctx = useRemirrorContext();

  // close the popup after clicking
  const handleClick = (command: () => void) => {
    return () => {
      command();
      setPopupOpen(false);
    };
  };

  // Notice that we won't close the popup after changing the cell background
  // because we want users to quick try multiple colors.
  const setTableCellBackground = (color: string | null) => {
    return () => {
      ctx.commands.setTableCellBackground(color);
    };
  };

  return (
    <div
      style={{
        position: 'absolute',
        backgroundColor: 'white',
        border: '1px solid red',
        width: '200px',
        display: popupOpen ? 'flex' : 'none',
        flexDirection: 'column',
      }}
    >
      <button onClick={setTableCellBackground('teal')}>change the cell color to teal</button>
      <button onClick={setTableCellBackground('rgba(255,100,100,0.3)')}>
        change the cell color to pink
      </button>
      <button onClick={setTableCellBackground(null)}>remove the cell color</button>

      <button onClick={handleClick(ctx.commands.addTableRowBefore)}>add a row above</button>
      <button onClick={handleClick(ctx.commands.addTableRowAfter)}>add a row below</button>
      <button onClick={handleClick(ctx.commands.addTableColumnBefore)}>add a column before</button>
      <button onClick={handleClick(ctx.commands.addTableColumnAfter)}>add a column after</button>

      <button onClick={handleClick(ctx.commands.deleteTableColumn)}>remove column</button>
      <button onClick={handleClick(ctx.commands.deleteTableRow)}>remove row</button>
      <button onClick={handleClick(ctx.commands.deleteTable)}>remove table</button>
    </div>
  );
};

const DefaultTableCellMenuComponent: React.FC<TableCellMenuComponentProps> = (props) => {
  return (
    <>
      <DefaultTableCellMenuButton {...props} />
      <DefaultTableCellMenuPopup {...props} />
    </>
  );
};

const TableCellMenu: React.FC<TableCellMenuProps> = ({
  Component = DefaultTableCellMenuComponent,
}) => {
  const position = usePositioner(menuCellPositioner, []);
  const { ref, width, height, x, y } = position;
  const [popupOpen, setPopupOpen] = useState(false);

  // Hide the popup when users click.
  useEvent('mousedown', () => {
    if (popupOpen) {
      setPopupOpen(false);
    }

    return false;
  });

  return (
    <PositionerPortal>
      <div
        ref={ref}
        style={{
          position: 'absolute',
          left: x,
          top: y,
          width: width + borderWidth,
          height: height + borderWidth,
          zIndex: 100,
          pointerEvents: 'none',

          // place the child into the top-left corner
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'flex-start',

          // for debug:
          // backgroundColor: 'lightpink',
          // opacity: 0.5,
        }}
      >
        <div
          style={{
            zIndex: 100,
            pointerEvents: 'initial',
          }}
        >
          <Component popupOpen={popupOpen} setPopupOpen={setPopupOpen} />
        </div>
      </div>
    </PositionerPortal>
  );
};

export { TableCellMenu };
