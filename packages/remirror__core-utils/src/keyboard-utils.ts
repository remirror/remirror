import { CoreUtilsMessages as Messages, MessageDescriptor } from '@remirror/messages';

import { environment } from './environment';

/**
 * Return true when the provided key is the the Command (⌘) key. Takes into
 * account the platform.
 */
function isCommandKey(key: string): boolean {
  const allowedKeys = ['command', 'cmd', 'meta'];

  if (environment.isMac) {
    allowedKeys.push('mod');
  }

  return allowedKeys.includes(key);
}

/**
 * Return true when the provided key is the the Control (⌃) key. Takes into
 * account the platform.
 */
function isControlKey(key: string): boolean {
  const allowedKeys = ['control', 'ctrl'];

  if (!environment.isMac) {
    allowedKeys.push('mod');
  }

  return allowedKeys.includes(key);
}

interface BaseKeyboardSymbol {
  /**
   * The normalized value for the symbol.
   */
  key: string;
}

interface I18nKeyboardSymbol extends BaseKeyboardSymbol {
  /**
   * The internationalized representation of the key.
   */
  i18n: MessageDescriptor;
}

interface ModifierKeyboardSymbol extends I18nKeyboardSymbol {
  /**
   * Modifier keys like 'shift' | 'alt' | 'meta'.
   */
  type: 'modifier';

  /**
   * The symbol for the modifier key.
   */
  symbol: string;
}

interface NamedKeyboardSymbol extends I18nKeyboardSymbol {
  /**
   * Named keys like `Enter` | `Escape`
   */
  type: 'named';

  /**
   * The potentially undefined symbol for the named key.
   */
  symbol?: string;
}

interface CharKeyboardSymbol extends BaseKeyboardSymbol {
  /**
   * Character keys like `a` | `b`
   */
  type: 'char';
}

type KeyboardSymbol = ModifierKeyboardSymbol | NamedKeyboardSymbol | CharKeyboardSymbol;

/**
 * Convert a keyboard shortcut into symbols which and keys.
 */
export function getShortcutSymbols(shortcut: string): KeyboardSymbol[] {
  const symbols: KeyboardSymbol[] = [];

  for (let key of shortcut.split('-')) {
    key = key.toLowerCase();

    if (isCommandKey(key)) {
      symbols.push({ type: 'modifier', symbol: '⌘', key: 'command', i18n: Messages.COMMAND_KEY });
      continue;
    }

    if (isControlKey(key)) {
      symbols.push({ type: 'modifier', symbol: '⌃', key: 'control', i18n: Messages.CONTROL_KEY });
      continue;
    }

    switch (key) {
      case 'shift':
        symbols.push({ type: 'modifier', symbol: '⇧', key, i18n: Messages.SHIFT_KEY });
        continue;

      case 'alt':
        symbols.push({ type: 'modifier', symbol: '⌥', key, i18n: Messages.ALT_KEY });
        continue;

      case '\n':
      case '\r':
      case 'enter':
        symbols.push({ type: 'named', symbol: '↵', key, i18n: Messages.ENTER_KEY });
        continue;

      case 'backspace':
        symbols.push({ type: 'named', symbol: '⌫', key, i18n: Messages.BACKSPACE_KEY });
        continue;

      case 'delete':
        symbols.push({ type: 'named', symbol: '⌦', key, i18n: Messages.DELETE_KEY });
        continue;

      case 'escape':
        symbols.push({ type: 'named', symbol: '␛', key, i18n: Messages.ESCAPE_KEY });
        continue;

      case 'tab':
        symbols.push({ type: 'named', symbol: '⇥', key, i18n: Messages.TAB_KEY });
        continue;

      case 'capslock':
        symbols.push({ type: 'named', symbol: '⇪', key, i18n: Messages.CAPS_LOCK_KEY });
        continue;

      case 'space':
        symbols.push({ type: 'named', symbol: '␣', key, i18n: Messages.SPACE_KEY });
        continue;

      case 'pageup':
        symbols.push({ type: 'named', symbol: '⤒', key, i18n: Messages.PAGE_UP_KEY });
        continue;

      case 'pagedown':
        symbols.push({ type: 'named', symbol: '⤓', key, i18n: Messages.PAGE_DOWN_KEY });
        continue;

      case 'home':
        symbols.push({ type: 'named', key, i18n: Messages.HOME_KEY });
        continue;

      case 'end':
        symbols.push({ type: 'named', key, i18n: Messages.END_KEY });
        continue;

      case 'arrowleft':
        symbols.push({ type: 'named', symbol: '←', key, i18n: Messages.ARROW_LEFT_KEY });
        continue;

      case 'arrowright':
        symbols.push({ type: 'named', symbol: '→', key, i18n: Messages.ARROW_RIGHT_KEY });
        continue;

      case 'arrowup':
        symbols.push({ type: 'named', symbol: '→', key, i18n: Messages.ARROW_UP_KEY });
        continue;

      case 'arrowdown':
        symbols.push({ type: 'named', symbol: '↓', key, i18n: Messages.ARROW_DOWN_KEY });
        continue;

      default:
        symbols.push({ type: 'char', key });
        continue;
    }
  }

  return symbols;
}
