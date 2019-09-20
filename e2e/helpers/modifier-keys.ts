// Taken from https://github.com/WordPress/gutenberg/blob/5bbda3656a530616a7a78c0a101d6ec2d8fa6a7a/packages/e2e-test-utils/src/press-key-with-modifier.js

import { ALT, COMMAND, CTRL, mod, SHIFT, take } from '@remirror/core';

/**
 * Emulates a Ctrl+A SelectAll key combination by dispatching custom keyboard
 * events and using the results of those events to determine whether to call
 * `document.execCommand( 'selectall' );`. This is necessary because Puppeteer
 * does not emulate Ctrl+A SelectAll in macOS. Events are dispatched to ensure
 * that any `Event#preventDefault` which would have normally occurred in the
 * application as a result of Ctrl+A is respected.
 *
 * @see https://github.com/GoogleChrome/puppeteer/issues/1313
 * @see https://w3c.github.io/uievents/tools/key-event-viewer.html
 */
export const selectAll = async () => {
  await page.evaluate(() => {
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
};

/**
 * A list of the lowercase shortcuts that should trigger the custom select all method.
 */
const selectAllShortcuts = ['cmd-a', 'meta-a', 'm-a', 'ctrl-a', 'control-a', 'c-a', 'mod-a'];

/**
 * Determines whether this is an apple machine
 */
const isApple = () => process.platform === 'darwin';

/**
 * Performs a key press with modifier (Shift, Control, Meta, Alt), where each modifier
 * is normalized to platform-specific modifier.
 *
 * ```tsx
 * pressKeyWithModifier('Mod-Shift-b');
 * ```
 */
export async function pressKeyWithModifier(pattern: string) {
  if (selectAllShortcuts.includes(pattern.toLowerCase())) {
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
    list.map(async modifier => {
      return page.keyboard.down(modifier);
    }),
  );

  await page.keyboard.press(key);

  await Promise.all(
    list.map(async modifier => {
      return page.keyboard.up(modifier);
    }),
  );
}

export { mod };

interface GetModifiersParams {
  /**
   * The modifier keys passed in
   */
  modifiers: string[];

  /**
   * Whether to treat this as a mac
   *
   * @defaultValue `false`
   */
  isMac?: boolean;
}

/**
 * Returns a list of normalized modifier keys
 */
export const getModifiers = ({ modifiers, isMac = false }: GetModifiersParams) => {
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
      throw new Error('Unrecognized modifier name: ' + modifier);
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
