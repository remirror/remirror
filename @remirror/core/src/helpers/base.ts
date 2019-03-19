/// <reference types="node" />

import memoizeOne from 'memoize-one';
import nano from 'nanoid';
import objectOmit from 'object.omit';
import objectPick from 'object.pick';
import { Literal } from '../types/base';

/**
 * Type cast an argument. If no type is provided it will default to any.
 *
 * @param arg
 */
export const Cast = <GType = any>(arg: any): GType => arg;

/**
 * Use this to create a Tuple with args that can be used as a type
 *
 * ```
 * const ALL_SUITS = tuple('hearts', 'diamonds', 'spades', 'clubs');
 * type SuitTuple = typeof ALL_SUITS;
 * type Suit = SuitTuple[number]; // union type
 * ```
 *
 * @param args
 */
export const tuple = <GType extends Literal[]>(...args: GType) => args;

/**
 * Finds all the regex matches for a string
 *
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

/**
 * A utility function to check whether the current browser is running on the android platform.
 */
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
 * @param str The string to format.
 */
export function format(str: string) {
  str = trim(str);
  return /^(?:webOS|i(?:OS|P))/.test(str) ? str : capitalize(str);
}

/**
 * Capitalizes a string value.
 *
 * @param str The string to capitalize.
 */
export function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Removes leading and trailing whitespace from a string.
 *
 * @param str The string to trim.
 */
export function trim(str: string) {
  return str.replace(/^ +| +$/g, '');
}

/**
 * Generate a random integer between min and max. If only one parameter is provided
 * minimum is set to 0.
 *
 * @param min
 * @param max
 */
export function randomInt(min: number, max?: number) {
  return Math.floor(randomFloat(min, max));
}

/**
 * Generate a random float between min and max. If only one parameter is provided
 * minimum is set to 0.
 *
 * @param min
 * @param max
 */
export function randomFloat(min: number, max?: number) {
  if (!max) {
    max = min;
    min = 0.0;
  }
  return Math.random() * (max - min + 1) + min;
}

/**
 * Converts a string, including strings in camelCase or snake_case, into Start Case (a variant
 * of Title Case where all words start with a capital letter), it keeps original single quote
 * and hyphen in the word.
 *
 *   'management_companies' to 'Management Companies'
 *   'managementCompanies' to 'Management Companies'
 *   `hell's kitchen` to `Hell's Kitchen`
 *   `co-op` to `Co-op`
 *
 * @param str
 */
export function startCase(str: string) {
  return str
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, (_, $1, $2) => $1 + ' ' + $2)
    .replace(/(\s|^)(\w)/g, (_, $1, $2) => $1 + $2.toUpperCase());
}

/**
 * Alias for caching function calls
 */
export const memoize = memoizeOne;

export interface UniqueIdParams {
  prefix?: string;
  size?: number;
}

/**
 * Generate a unique id
 *
 * @param params
 */
export function uniqueId({ prefix = '', size }: UniqueIdParams = { prefix: '' }) {
  return `${prefix}${nano(size)}`;
}

/**
 * Takes a number of elements from the provided array starting from the zero-index
 *
 * @param arr
 * @param num
 */
export function take<GArray extends any[]>(arr: GArray, num: number) {
  num = Math.max(Math.min(0, num), num);
  return arr.slice(0, num);
}

/**
 * Alias for picking properties from an object
 */
export const pick = objectPick;

/**
 * Alias for excluding properties from an object
 */
export const omit = objectOmit;

export const environment = {
  /**
   * Verifies that the environment has both a window and window.document
   */
  get isBrowser() {
    return (
      typeof window !== 'undefined' &&
      typeof window.document !== 'undefined' &&
      window.navigator &&
      window.navigator.userAgent
    );
  },

  /**
   * Verifies that the environment is JSDOM
   */
  get isJSDOM() {
    return environment.isBrowser && window.navigator.userAgent.includes('jsdom');
  },

  /**
   * Verifies that the environment has a nodejs process and is therefore a node environment
   */
  get isNode() {
    return typeof process !== 'undefined' && process.versions != null && process.versions.node != null;
  },

  get isMac() {
    return environment.isBrowser && /Mac/.test(navigator.platform);
  },
};

/**
 * Makes sure a value is either true or false
 *
 * @param val
 */
export const bool = (val: unknown) => Boolean(val);
