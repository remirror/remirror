import React from 'react';
import { useHelpers } from '@remirror/react-core';

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
   * @defaultValue true
   */
  enableTableCellMenu?: boolean;

  /**
   * The props that will passed to `TableCellMenu`
   */
  tableCellMenuProps?: TableCellMenuProps;

  /**
   * Whether to use `TableDeleteRowColumnButton`.
   *
   * @defaultValue true
   */
  enableTableDeleteRowColumnButton?: boolean;

  /**
   * The props that will passed to `TableDeleteRowColumnButton`
   */
  tableDeleteRowColumnButtonProps?: TableDeleteRowColumnButtonProps;

  /**
   * Whether to use `TableDeleteButton`.
   *
   * @defaultValue true
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
  const { isViewEditable } = useHelpers();

  if (!isViewEditable()) {
    return null;
  }

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
