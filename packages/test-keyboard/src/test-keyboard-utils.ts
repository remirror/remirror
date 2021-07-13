import { omit } from '@remirror/core-helpers';
import type { Shape } from '@remirror/core-types';

import type { KeyboardEventName, ModifierInformation } from './test-keyboard-types';
import { KeyDefinition, SupportedCharacters, usKeyboardLayout } from './us-keyboard-layout';

/**
 * Creates a keyboard event which can be dispatched into the DOM
 *
 * @param type
 * @param options
 */
export function createKeyboardEvent(
  type: KeyboardEventName,
  options: KeyboardEventInit & Shape,
): KeyboardEvent {
  return new KeyboardEvent(type, { ...options, bubbles: true });
}

interface GetModifierInformationProps {
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

/**
 * Returns an info object detailing which modifier keys are currently active
 *
 * @param props
 */
export function getModifierInformation(props: GetModifierInformationProps): ModifierInformation {
  const { modifiers, isMac = false } = props;
  const info: ModifierInformation = {
    altKey: false,
    ctrlKey: false,
    shiftKey: false,
    metaKey: false,
  };

  for (const modifier of modifiers) {
    if (/^(cmd|meta|m)$/i.test(modifier)) {
      info.metaKey = true;
    } else if (/^a(lt)?$/i.test(modifier)) {
      info.altKey = true;
    } else if (/^(c|ctrl|control)$/i.test(modifier)) {
      info.ctrlKey = true;
    } else if (/^s(hift)?$/i.test(modifier)) {
      info.shiftKey = true;
    } else if (/^mod$/i.test(modifier)) {
      if (isMac) {
        info.metaKey = true;
      } else {
        info.ctrlKey = true;
      }
    } else {
      throw new Error(`Unrecognized modifier name: ${modifier}`);
    }
  }

  return info;
}

/**
 * Removes the shiftKey property from the keyboard layout spec
 *
 * @param key
 */
export function cleanKey(key: SupportedCharacters): Omit<KeyDefinition, 'shiftKey'> {
  return omit(usKeyboardLayout[key], ['shiftKey']);
}
