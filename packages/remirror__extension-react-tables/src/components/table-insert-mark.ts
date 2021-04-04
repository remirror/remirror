import { h } from 'jsx-dom';
import { ExtensionTablesTheme } from '@remirror/theme';

const TableInsertMark = (): HTMLElement[] => {
  return [
    h('div', { className: ExtensionTablesTheme.TABLE_CONTROLLER_MARK_ROW_CORNER }),
    h('div', { className: ExtensionTablesTheme.TABLE_CONTROLLER_MARK_COLUMN_CORNER }),
  ];
};

export default TableInsertMark;
