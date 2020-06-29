import { ExtensionPriority, Preset } from '@remirror/core';

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
      new TableExtension({ priority: ExtensionPriority.Low }),
      new TableRowExtension({ priority: ExtensionPriority.Low }),
      new TableCellExtension({ priority: ExtensionPriority.Low }),
      new TableHeaderCell({ priority: ExtensionPriority.Low }),
    ];
  }

  protected onSetOptions(): void {}
}
