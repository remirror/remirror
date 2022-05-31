import React, { useState } from 'react';
import { PositionerPortal } from '@remirror/react-components';
import { useCommands } from '@remirror/react-core';
import { useEditorEvent, usePositioner } from '@remirror/react-hooks';
import { ComponentsTheme } from '@remirror/theme';

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
      className={ComponentsTheme.BUTTON}
    >
      v
    </button>
  );
};

interface DefaultTableCellMenuItemProps {
  label: string;
  onClick: () => void;
}
const DefaultTableCellMenuItem: React.FC<DefaultTableCellMenuItemProps> = (props) => (
  <button onClick={props.onClick} className={ComponentsTheme.MENU_ITEM}>
    {props.label}
  </button>
);

const DefaultTableCellMenuPopup: React.FC<TableCellMenuComponentProps> = ({
  setPopupOpen,
  popupOpen,
}) => {
  const commands = useCommands();

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
      commands.setTableCellBackground(color);
    };
  };

  return (
    <div
      style={{
        position: 'absolute',
        backgroundColor: 'white',
        width: '200px',
        border: '1px solid lightgray',
        display: popupOpen ? 'flex' : 'none',
        flexDirection: 'column',
      }}
      className={ComponentsTheme.MENU}
    >
      <DefaultTableCellMenuItem label='Color teal' onClick={setTableCellBackground('teal')} />
      <DefaultTableCellMenuItem
        label='Color pink'
        onClick={setTableCellBackground('rgba(255,100,100,0.3)')}
      />
      <DefaultTableCellMenuItem label='Remove color' onClick={setTableCellBackground(null)} />

      <DefaultTableCellMenuItem
        label='Add row above'
        onClick={handleClick(commands.addTableRowBefore)}
      />
      <DefaultTableCellMenuItem
        label='Add row below'
        onClick={handleClick(commands.addTableRowAfter)}
      />
      <DefaultTableCellMenuItem
        label='Add column before'
        onClick={handleClick(commands.addTableColumnBefore)}
      />
      <DefaultTableCellMenuItem
        label='Add column after'
        onClick={handleClick(commands.addTableColumnAfter)}
      />

      <DefaultTableCellMenuItem
        label='Remove column'
        onClick={handleClick(commands.deleteTableColumn)}
      />
      <DefaultTableCellMenuItem label='Remove row' onClick={handleClick(commands.deleteTableRow)} />
      <DefaultTableCellMenuItem label='Remove table' onClick={handleClick(commands.deleteTable)} />
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
  useEditorEvent('mousedown', () => {
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
