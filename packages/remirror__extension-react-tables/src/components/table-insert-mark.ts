import { ExtensionTablesTheme } from '@remirror/theme';

import { h } from '../utils/dom';

const TableInsertMark = (): HTMLElement[] => {
  return [
    h('div', { className: ExtensionTablesTheme.TABLE_CONTROLLER_MARK_ROW_CORNER }),
    h('div', { className: ExtensionTablesTheme.TABLE_CONTROLLER_MARK_COLUMN_CORNER }),
  ];
};

export default TableInsertMark;
