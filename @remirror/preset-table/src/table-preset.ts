import {
  DefaultPresetOptions,
  ExtensionPriority,
  OnSetOptionsParameter,
  Preset,
} from '@remirror/core';

import {
  TableCellExtension,
  TableExtension,
  TableHeaderCell,
  TableOptions,
  TableRowExtension,
} from './table-extensions';

/**
 * The table is packaged up as preset for simpler consumption.
 */
export class TablePreset extends Preset<TableOptions> {
  static readonly defaultOptions: DefaultPresetOptions<TableOptions> = {
    ...TableExtension.defaultOptions,
  };

  get name() {
    return 'table' as const;
  }

  /**
   * Create the table extensions. Set the priority to low so that they appear
   * lower down in the node list.
   */
  createExtensions() {
    return [
      new TableExtension({ priority: ExtensionPriority.Low, resizable: this.options.resizable }),
      new TableRowExtension({ priority: ExtensionPriority.Low }),
      new TableCellExtension({ priority: ExtensionPriority.Low }),
      new TableHeaderCell({ priority: ExtensionPriority.Low }),
    ];
  }

  protected onSetOptions(parameter: OnSetOptionsParameter<TableOptions>) {
    const { changes } = parameter;

    if (changes.resizable.changed) {
      this.getExtension(TableExtension).setOptions({ resizable: changes.resizable.value });
    }
  }
}
