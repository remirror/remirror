import { omit } from '@remirror/core-helpers';
import { PlainObject } from '@remirror/core-types';
import { KeyboardEventName, ModifierInformation } from './test-keyboard-types';
import { SupportedCharacters, usKeyboardLayout } from './us-keyboard-layout';

/**
 * Creates a keyboard event which can be dispatched into the DOM
 *
 * @param type
 * @param options
 */
export const createKeyboardEvent = (type: KeyboardEventName, options: KeyboardEventInit & PlainObject) =>
  new KeyboardEvent(type, { ...options, bubbles: true });

interface GetModifierInformationParams {
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
 * Returns an info object detailing which modifier keys are currently active
 *
 * @param params
 * @param params.modifiers
 * @param [params.isMac]
 */
export const getModifierInformation = ({ modifiers, isMac = false }: GetModifierInformationParams) => {
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
};

/**
 * Removes the shiftKey property from the keyboard layout spec
 *
 * @param key
 */
export const cleanKey = (key: SupportedCharacters) => omit(usKeyboardLayout[key], ['shiftKey']);
