import { environment } from './environment';

/**
 * Keycode for ALT key.
 */
export const ALT = 'Alt';

/**
 * Keycode for CTRL key.
 */
export const CTRL = 'Control';

/**
 * Keycode for COMMAND/META key.
 */
export const COMMAND = 'Meta';

/**
 * Keycode for SHIFT key.
 */
export const SHIFT = 'Shift';

/**
 * Shorthand names for common modifier key combinations which should `just` work on Apple and PC.
 */
export const Modifier = {
  Primary: (isMac?: boolean) => (isMac ? [COMMAND] : [CTRL]),
  PrimaryShift: (isMac?: boolean) => (isMac ? [SHIFT, COMMAND] : [CTRL, SHIFT]),
  PrimaryAlt: (isMac?: boolean) => (isMac ? [ALT, COMMAND] : [CTRL, ALT]),
  Secondary: (isMac?: boolean) => (isMac ? [SHIFT, ALT, COMMAND] : [CTRL, SHIFT, ALT]),
  Access: (isMac?: boolean) => (isMac ? [CTRL, ALT] : [SHIFT, ALT]),
  Ctrl: () => [CTRL],
  Alt: () => [ALT],
  CtrlShift: () => [CTRL, SHIFT],
  Shift: () => [SHIFT],
  ShiftAlt: () => [SHIFT, ALT],
};

/**
 * The cross platform modifier key combination names.
 */
export type ModifierKeys = keyof typeof Modifier;

/**
 * Returns true if this is an apple environment either on the server or the client.
 */
export const isApple = () => environment.isApple;

/**
 * Create a consistent cross platform modifier string pattern.
 *
 * This can be used with the pressKeyWithModifier.
 *
 * ```ts
 * mod('Primary', 'A')
 * // => 'Control-A' // on PC
 * // => 'Cmd-A' // on Mac
 * ```
 *
 * @param modifier - A named modifier which is consistent across platforms
 *                  e.g. 'Primary' refers to 'Meta' on a mac and 'Control' on a PC
 * @param key - the key to press with the modifier. e.g. `Space` | `Enter`
 * @param [isApple] - a method which returns true when this is an apple device.
 */
export const mod = (modifier: ModifierKeys, key: string, isMacFn = isApple) => {
  switch (modifier) {
    case 'Primary':
      return `${Modifier[modifier](isMacFn()).join('-')}-${key}`;
    case 'PrimaryShift':
      return `${Modifier[modifier](isMacFn()).join('-')}-${key}`;
    case 'PrimaryAlt':
      return `${Modifier[modifier](isMacFn()).join('-')}-${key}`;
    case 'Secondary':
      return `${Modifier[modifier](isMacFn()).join('-')}-${key}`;
    case 'Access':
      return `${Modifier[modifier](isMacFn()).join('-')}-${key}`;
    case 'Ctrl':
      return `${Modifier[modifier]().join('-')}-${key}`;
    case 'Alt':
      return `${Modifier[modifier]().join('-')}-${key}`;
    case 'CtrlShift':
      return `${Modifier[modifier]().join('-')}-${key}`;
    case 'Shift':
      return `${Modifier[modifier]().join('-')}-${key}`;
    case 'ShiftAlt':
      return `${Modifier[modifier]().join('-')}-${key}`;

    default:
      throw new Error('Invalid modifier name passed in');
  }
};
