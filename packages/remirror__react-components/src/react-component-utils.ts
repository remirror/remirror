import {
  capitalize,
  CommandDecoratorMessageProps,
  CommandDecoratorShortcut,
  CommandDecoratorValue,
  getShortcutSymbols,
  includes,
  isArray,
  isEqual,
  isFunction,
  isString,
  ProsemirrorAttributes,
} from '@remirror/core';
import type { I18n } from '@remirror/i18n';

/**
 * Get the value from the option passed into the command.
 */

export function getCommandOptionValue<Type>(
  value: CommandDecoratorValue<Type> | undefined,
  commandProps: CommandDecoratorMessageProps,
): Type | undefined {
  return isFunction(value) ? value(commandProps) : value;
}

/**
 * Checks whether the first element in an array is a string and assumes the
 * whole array is a string array.
 */
function isStringArray(array: unknown[]): array is string[] {
  return isString(array[0]);
}
/**
 * Get the string value from the available UI Shortcut.
 */

export function getUiShortcutString(
  uiShortcut: CommandDecoratorShortcut,
  attrs: ProsemirrorAttributes,
): string {
  if (isString(uiShortcut)) {
    return uiShortcut;
  }

  if (!isArray(uiShortcut)) {
    return uiShortcut.shortcut;
  }

  if (isStringArray(uiShortcut)) {
    return uiShortcut[0] ?? '';
  }

  return (
    (uiShortcut.find((shortcut) => isEqual(shortcut.attrs, attrs)) ?? uiShortcut[0])?.shortcut ?? ''
  );
}

/**
 * How to display the symbols.
 */
type Modifiers = 'shift' | 'command' | 'control' | 'alt';

interface ShortcutStringOptions {
  /**
   * True to display all named values as symbols (where possible, otherwise
   * display the translated string).
   *
   * @default false
   */
  namedAsSymbol?: boolean | string[];

  /**
   * `true` to display modifiers as symbols. `false` to display as translated strings.
   *
   * An array to only set the provided array values as symbols.
   *
   * @default true
   */
  modifierAsSymbol?: boolean | Modifiers[];

  /**
   * How the values should be cased.
   *
   * @default 'title'
   */
  casing?: keyof typeof CASINGS;

  /**
   * The separator to use between symbols.
   *
   * @default ' '
   */
  separator?: string;

  /**
   * A translation utility for translating a predefined string / or message
   * descriptor.
   */
  t: I18n['_'];
}

const CASINGS = {
  title: (value: string) => capitalize(value),
  upper: (value: string) => value.toLocaleUpperCase(),
  lower: (value: string) => value.toLocaleLowerCase(),
};

/**
 * Get a normalized shortcut as a string.
 */
export function getShortcutString(shortcut: string, options: ShortcutStringOptions): string {
  const {
    casing = 'title',
    namedAsSymbol = false,
    modifierAsSymbol = true,
    separator = ' ',
    t,
  } = options;

  const symbols = getShortcutSymbols(shortcut);
  const stringSymbols: string[] = [];

  const transform = CASINGS[casing];

  for (const sym of symbols) {
    if (sym.type === 'char') {
      stringSymbols.push(transform(sym.key));
      continue;
    }

    if (sym.type === 'named') {
      const value =
        namedAsSymbol === true || (isArray(namedAsSymbol) && includes(namedAsSymbol, sym.key))
          ? sym.symbol ?? t(sym.i18n)
          : t(sym.i18n);
      stringSymbols.push(transform(value));

      continue;
    }

    const value =
      modifierAsSymbol === true ||
      (isArray(modifierAsSymbol) && includes(modifierAsSymbol, sym.key))
        ? sym.symbol
        : t(sym.i18n);
    stringSymbols.push(transform(value));
  }

  return stringSymbols.join(separator);
}
