import { Preset } from '@remirror/core';

import {
  TableCellExtension,
  TableExtension,
  TableHeaderCell,
  TableRowExtension,
} from './table-extensions';

/**
 * The table is packaged up as preset for simpler
 */
export class TablePreset extends Preset {
  static enable() {
    document.execCommand('enableObjectResizing', false, 'false');
    document.execCommand('enableInlineTableEditing', false, 'false');
  }

  get name() {
    return 'table' as const;
  }

  createExtensions() {
    return [
      new TableExtension(),
      new TableRowExtension(),
      new TableCellExtension(),
      new TableHeaderCell(),
    ];
  }

  protected onSetOptions(): void {}
}
