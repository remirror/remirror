import { BaseExtensionOptions, CommandFunction, environment, Extension } from '@remirror/core';
import { history, redo, undo } from 'prosemirror-history';

export interface HistoryExtensionOptions extends BaseExtensionOptions {
  /**
   * The amount of history events that are collected before the
   * oldest events are discarded.
   *
   * @defaultValue `100`
   */
  depth?: number | null;

  /**
   * The delay (ms) between changes after which a new group should be
   * started. Note that when changes
   * aren't adjacent, a new group is always started.
   *
   * @defaultValue `500`
   */
  newGroupDelay?: number | null;
}
export class HistoryExtension extends Extension<HistoryExtensionOptions> {
  get name() {
    return 'history' as const;
  }

  get defaultOptions() {
    return {
      depth: 100,
      newGroupDelay: 500,
    };
  }

  public keys() {
    const keymap: Record<'Mod-z' | 'Shift-Mod-z' | 'Mod-y', CommandFunction> = {
      'Mod-y': () => false,
      'Mod-z': undo,
      'Shift-Mod-z': redo,
    };

    if (!environment.isMac) {
      keymap['Mod-y'] = redo;
    }

    return keymap;
  }

  public plugin() {
    const { depth, newGroupDelay } = this.options;
    return history({ depth, newGroupDelay });
  }

  public commands() {
    return {
      undo: () => undo,
      redo: () => redo,
    };
  }
}
