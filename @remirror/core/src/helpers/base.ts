import { Literal } from '../types';

/**
 * Type cast an argument
 * @param arg
 */
export const Cast = <GType = any>(arg: any): GType => arg;

/**
 * Use this to create a Tuple with args that can be used as a type
 *
 * @example
 * ```
 * const ALL_SUITS = tuple('hearts', 'diamonds', 'spades', 'clubs');
 * type SuitTuple = typeof ALL_SUITS;
 * type Suit = SuitTuple[number]; // union type
 * ```
 * @param args
 */
export const tuple = <GType extends Literal[]>(...args: GType) => args;

/**
 * Finds all the regex matches for a string
 * @param text
 * @param regexp
 */
export const findMatches = (text: string, regexp: RegExp) => {
  const results: RegExpExecArray[] = [];
  for (let match = regexp.exec(text); match !== null; match = regexp.exec(text)) {
    results.push(match);
  }
  return results;
};

export const isAndroidOS = () => {
  const ua = navigator.userAgent;
  const match = RegExp('\\b' + 'Android' + '(?:/[\\d.]+|[ \\w.]*)', 'i').exec(ua);
  if (!match) {
    return false;
  }
  const outcome = cleanupOS(match[0], 'Android', 'Android');
  console.log('The outcome is', outcome);
  return outcome.includes('Android');
};

/**
 * A utility function to clean up the OS name.
 *
 * @private
 * @param os The OS name to clean up.
 * @param [pattern] A `RegExp` pattern matching the OS name.
 * @param [label] A label for the OS.
 */
export function cleanupOS(os: string, pattern?: string, label?: string) {
  if (pattern && label) {
    os = os.replace(RegExp(pattern, 'i'), label);
  }

  const val = format(
    os
      .replace(/ ce$/i, ' CE')
      .replace(/\bhpw/i, 'web')
      .replace(/\bMacintosh\b/, 'Mac OS')
      .replace(/_PowerPC\b/i, ' OS')
      .replace(/\b(OS X) [^ \d]+/i, '$1')
      .replace(/\bMac (OS X)\b/, '$1')
      .replace(/\/(\d)/, ' $1')
      .replace(/_/g, '.')
      .replace(/(?: BePC|[ .]*fc[ \d.]+)$/i, '')
      .replace(/\bx86\.64\b/gi, 'x86_64')
      .replace(/\b(Windows Phone) OS\b/, '$1')
      .replace(/\b(Chrome OS \w+) [\d.]+\b/, '$1')
      .split(' on ')[0],
  );

  return val;
}

/**
 * Trim and conditionally capitalize string values.
 *
 * @private
 * @param str The string to format.
 */
export function format(str: string) {
  str = trim(str);
  return /^(?:webOS|i(?:OS|P))/.test(str) ? str : capitalize(str);
}

/**
 * Capitalizes a string value.
 *
 * @private
 * @param str The string to capitalize.
 */
export function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Removes leading and trailing whitespace from a string.
 *
 * @private
 * @param str The string to trim.
 */
export function trim(str: string) {
  return str.replace(/^ +| +$/g, '');
}
