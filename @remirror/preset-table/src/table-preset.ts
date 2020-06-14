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
