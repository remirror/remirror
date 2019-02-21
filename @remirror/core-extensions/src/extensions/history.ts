import { CommandFunction, Extension } from '@remirror/core';
import { history, redo, undo } from 'prosemirror-history';

export class History extends Extension {
  public name = 'history';

  public keys() {
    const isMac = typeof navigator !== 'undefined' ? /Mac/.test(navigator.platform) : false;
    const keymap: Record<'Mod-z' | 'Shift-Mod-z' | 'Mod-y', CommandFunction> = {
      'Mod-y': () => false,
      'Mod-z': undo,
      'Shift-Mod-z': redo,
    };

    if (!isMac) {
      keymap['Mod-y'] = redo;
    }

    return keymap;
  }

  public plugins() {
    return [history()];
  }

  public commands() {
    return {
      undo: () => undo,
      redo: () => redo,
    };
  }
}
