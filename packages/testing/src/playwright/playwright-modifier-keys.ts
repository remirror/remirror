/**
 * @module
 *
 * Some of the testing utils are adapted from
 * https://github.com/WordPress/gutenberg/blob/5bbda3656a530616a7a78c0a101d6ec2d8fa6a7a/packages/e2e-test-utils/src/press-key-with-modifier.js
 */

import delay from 'delay';
import { Page } from 'playwright';
import { take } from '@remirror/core';

/**
 * Keycode for ALT key.
 */
export const ALT = ['Alt', '⌥'] as const;

/**
 * Keycode for CTRL key.
 */
export const CTRL = ['Control', '⌃'] as const;

/**
 * Keycode for COMMAND/META key.
 */
export const COMMAND = ['Meta', '⌘'] as const;

/**
 * Keycode for SHIFT key.
 */
export const SHIFT = ['Shift', '⇧'] as const;

/**
 * Keycode for the windows key
 */
export const WINDOWS = ['Windows', '', '❖'];

/**
 * Keycode and symbols for caps lock
 */
export const CAPS_LOCK = ['CapsLock', '⇪', '⇪'];

/**
 * Shorthand names for common modifier key combinations which should `just` work on Apple and PC.
 */
export const Modifier = {
  Primary: (isMac?: boolean) => (isMac ? [COMMAND[0]] : [CTRL[0]]),
  PrimaryShift: (isMac?: boolean) => (isMac ? [SHIFT[0], COMMAND[0]] : [CTRL[0], SHIFT[0]]),
  PrimaryAlt: (isMac?: boolean) => (isMac ? [ALT[0], COMMAND[0]] : [CTRL[0], ALT[0]]),
  Secondary: (isMac?: boolean) =>
    isMac ? [SHIFT[0], ALT[0], COMMAND[0]] : [CTRL[0], SHIFT[0], ALT[0]],
  Access: (isMac?: boolean) => (isMac ? [CTRL[0], ALT[0]] : [SHIFT[0], ALT[0]]),
  Ctrl: () => [CTRL[0]],
  Alt: () => [ALT[0]],
  CtrlShift: () => [CTRL[0], SHIFT[0]],
  Shift: () => [SHIFT[0]],
  ShiftAlt: () => [SHIFT[0], ALT[0]],
};

/**
 * The cross platform modifier key combination names.
 */
export type ModifierKeys = keyof typeof Modifier;

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
export function mod(modifier: ModifierKeys, key: string, isMacFn = isApple): string {
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
}

/**
 * Returns a list of normalized modifier keys
 */
export const getModifiers = ({ modifiers, isMac = false }: GetModifiersProps) => {
  const list: string[] = [];

  for (const modifier of modifiers) {
    if (/^(cmd|meta|m)$/i.test(modifier)) {
      list.push(COMMAND[0]);
    } else if (/^a(lt)?$/i.test(modifier)) {
      list.push(ALT[0]);
    } else if (/^(c|ctrl|control)$/i.test(modifier)) {
      list.push(CTRL[0]);
    } else if (/^s(hift)?$/i.test(modifier)) {
      list.push(SHIFT[0]);
    } else if (/^mod$/i.test(modifier)) {
      if (isMac) {
        list.push(COMMAND[0]);
      } else {
        list.push(CTRL[0]);
      }
    } else {
      throw new Error(`Unrecognized modifier name: ${modifier}`);
    }
  }

  return list;
};

/**
 * The modifier keys currently active
 */
export interface ModifierInformation {
  /**
   * Whether the `Shift` key is active
   */

  shiftKey: boolean;
  /**
   * Whether the `Meta` key is active
   */

  metaKey: boolean;
  /**
   * Whether the `Control` key is active
   */

  ctrlKey: boolean;
  /**
   * Whether the `Alt` key is active
   */

  altKey: boolean;
}

/**
 * Emulates a Ctrl+A SelectAll key combination by dispatching custom keyboard
 * events and using the results of those events to determine whether to call
 * `document.execCommand( 'selectall' );`. This is necessary because
 * `playwright` does not emulate Ctrl+A SelectAll in macOS. Events are
 * dispatched to ensure that any `Event#preventDefault` which would have
 * normally occurred in the application as a result of Ctrl+A is respected.
 *
 * @see https://github.com/GoogleChrome/puppeteer/issues/1313
 * @see https://w3c.github.io/uievents/tools/key-event-viewer.html
 */
export const selectAll = async (options: { delay?: number; page?: Page } = {}) => {
  const { page: playwrightPage = page } = options;

  await playwrightPage.evaluate(() => {
    const isMac = /Mac|iPod|iPhone|iPad/.test(window.navigator.platform);

    const dom = document.activeElement;

    if (!dom) {
      return;
    }

    dom.dispatchEvent(
      new KeyboardEvent('keydown', {
        bubbles: true,
        cancelable: true,
        key: isMac ? 'Meta' : 'Control',
        code: isMac ? 'MetaLeft' : 'ControlLeft',
        location: KeyboardEvent.DOM_KEY_LOCATION_LEFT,
        getModifierState: (keyArg: string) => keyArg === (isMac ? 'Meta' : 'Control'),
        ctrlKey: !isMac,
        metaKey: isMac,
        charCode: 0,
        keyCode: isMac ? 93 : 17,
        which: isMac ? 93 : 17,
      } as KeyboardEventInit),
    );

    const preventableEvent = new KeyboardEvent('keydown', {
      bubbles: true,
      cancelable: true,
      key: 'a',
      code: 'KeyA',
      location: KeyboardEvent.DOM_KEY_LOCATION_STANDARD,
      getModifierState: (keyArg: string) => keyArg === (isMac ? 'Meta' : 'Control'),
      ctrlKey: !isMac,
      metaKey: isMac,
      charCode: 0,
      keyCode: 65,
      which: 65,
    } as KeyboardEventInit);

    const wasPrevented = !dom.dispatchEvent(preventableEvent) || preventableEvent.defaultPrevented;

    if (!wasPrevented) {
      document.execCommand('selectall', false);
    }

    dom.dispatchEvent(
      new KeyboardEvent('keyup', {
        bubbles: true,
        cancelable: true,
        key: isMac ? 'Meta' : 'Control',
        code: isMac ? 'MetaLeft' : 'ControlLeft',
        location: KeyboardEvent.DOM_KEY_LOCATION_LEFT,
        getModifierState: () => false,
        charCode: 0,
        keyCode: isMac ? 93 : 17,
        which: isMac ? 93 : 17,
      } as KeyboardEventInit),
    );
  });

  if (options.delay) {
    return delay(options.delay);
  }
};

/**
 * A list of the lowercase shortcuts that should trigger the custom select all method.
 */
const selectAllShortcuts = new Set([
  'cmd-a',
  'meta-a',
  'm-a',
  'ctrl-a',
  'control-a',
  'c-a',
  'mod-a',
]);

/**
 * Determines whether this is an apple machine
 */
export function isApple() {
  return process.platform === 'darwin';
}

/**
 * Performs a key press with modifier (Shift, Control, Meta, Alt), where each modifier
 * is normalized to platform-specific modifier.
 *
 * ```tsx
 * pressKeyWithModifier('Mod-Shift-b');
 * ```
 */
export async function pressKeyWithModifier(pattern: string): Promise<void> {
  if (selectAllShortcuts.has(pattern.toLowerCase())) {
    return selectAll();
  }

  let modifiers = pattern.split(/-(?!$)/);
  let key = modifiers[modifiers.length - 1];
  modifiers = take(modifiers, modifiers.length - 1);

  if (key === 'Space') {
    key = ' ';
  }

  const list = getModifiers({ modifiers, isMac: isApple() });

  await Promise.all(
    list.map(async (modifier) => {
      return page.keyboard.down(modifier);
    }),
  );

  if (!key) {
    return;
  }

  await page.keyboard.press(key);

  await Promise.all(
    list.map(async (modifier) => {
      return page.keyboard.up(modifier);
    }),
  );
}

interface GetModifiersProps {
  /**
   * The modifier keys passed in
   */
  modifiers: string[];

  /**
   * Whether to treat this as a mac
   *
   * @default false
   */
  isMac?: boolean;
}
