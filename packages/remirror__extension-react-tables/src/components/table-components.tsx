import React from 'react';

import { TableCellMenu, TableCellMenuProps } from './table-cell-menu';
import {
  TableDeleteRowColumnButton,
  TableDeleteRowColumnButtonProps,
} from './table-delete-row-column-button';
import { TableDeleteButton, TableDeleteButtonProps } from './table-delete-table-button';

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

  /**
   * Whether to use `TableDeleteButton`.
   *
   * @default true
   */
  enableTableDeleteButton?: boolean;

  /**
   * The props that will passed to `TableDeleteButton`
   */
  tableDeleteButtonProps?: TableDeleteButtonProps;
}

export const TableComponents: React.FC<TableComponentsProps> = ({
  enableTableCellMenu = true,
  enableTableDeleteRowColumnButton = true,
  enableTableDeleteButton = true,
  tableCellMenuProps,
  tableDeleteRowColumnButtonProps,
  tableDeleteButtonProps,
}) => {
  return (
    <>
      {enableTableCellMenu && <TableCellMenu {...tableCellMenuProps} />}
      {enableTableDeleteRowColumnButton && (
        <TableDeleteRowColumnButton {...tableDeleteRowColumnButtonProps} />
      )}
      {enableTableDeleteButton && <TableDeleteButton {...tableDeleteButtonProps} />}
    </>
  );
};
