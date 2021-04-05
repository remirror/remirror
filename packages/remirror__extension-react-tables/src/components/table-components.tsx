import React from 'react';

import { TableCellMenu, TableCellMenuProps } from './table-cell-menu';
import { TableDeleteRowColumnButton, TableDeleteRowColumnButtonProps } from './table-delete-button';

export interface TableComponentsProps {
  /**
   * Whether to use `TableCellMenu`.
   *
   * @default true
   */
  enableTableCellMenu?: boolean;

  /**
   * The props that will passed to `TableCellMenu`
   */
  tableCellMenuProps?: TableCellMenuProps;

  /**
   * Whether to use `TableDeleteRowColumnButton`.
   *
   * @default true
   */
  enableTableDeleteRowColumnButton?: boolean;

  /**
   * The props that will passed to `TableDeleteRowColumnButton`
   */
  tableDeleteRowColumnButtonProps?: TableDeleteRowColumnButtonProps;
}

const defaultTableComponentsProps: TableComponentsProps = {
  enableTableCellMenu: true,
  enableTableDeleteRowColumnButton: true,
};

export const TableComponents: React.FC<TableComponentsProps> = (props) => {
  props = { ...defaultTableComponentsProps, ...props };
  return (
    <>
      {props.enableTableCellMenu ? <TableCellMenu {...props.tableCellMenuProps} /> : null}
      {props.enableTableDeleteRowColumnButton ? (
        <TableDeleteRowColumnButton {...props.tableDeleteRowColumnButtonProps} />
      ) : null}
    </>
  );
};
