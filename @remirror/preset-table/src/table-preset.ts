import { Preset } from '@remirror/core';

/**
 * The table is packaged up as preset for simpler
 */
export class TablePreset extends Preset {
  get name() {
    return 'table' as const;
  }

  public createExtensions() {
    return [];
  }

  protected onSetOptions(): void {}
}
