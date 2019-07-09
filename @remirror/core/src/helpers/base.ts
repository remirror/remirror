/// <reference types="node" />

import fastDeepEqual from 'fast-deep-equal';
import memoizeOne from 'memoize-one';
import nano from 'nanoid';
import objectOmit from 'object.omit';
import objectPick from 'object.pick';
import { AnyConstructor, AnyFunction, PlainObject } from '../types/base';

/**
 * Type cast an argument. If no type is provided it will default to any.
 *
 * @param arg - the arg to typecast
 *
 * @public
 *
 */
export const Cast = <GType = any>(arg: any): GType => arg;

/**
 * Calls a function if defined and provides compile time type checking for the passed in parameters.
 *
 * @param fn - the function to call if it exists
 * @param args - the rest of the parameters with types
 */
export const callIfDefined = <GFunc extends AnyFunction>(fn: GFunc | unknown, ...args: Parameters<GFunc>) => {
  if (isFunction(fn)) {
    fn(...args);
  }
};

/**
 * Finds all the regex matches for a string
 *
 * @param text - the text to check against
 * @param regexp - the regex (which should include a 'g' flag)
 *
 * @public
 */
export const findMatches = (text: string, regexp: RegExp) => {
  const results: RegExpExecArray[] = [];
  const flags = regexp.flags;
  if (!flags.includes('g')) {
    regexp = new RegExp(regexp.source, `g${flags}`);
  }

  for (let match = regexp.exec(text); match !== null; match = regexp.exec(text)) {
    results.push(match);
  }

  return results;
};

/**
 * A utility function to check whether the current browser is running on the android platform.
 * @public
 */
export const isAndroidOS = () => {
  const ua = navigator.userAgent;
  const match = RegExp('\\b' + 'Android' + '(?:/[\\d.]+|[ \\w.]*)', 'i').exec(ua);
  if (!match) {
    return false;
  }
  return cleanupOS(match[0], 'Android', 'Android').includes('Android');
};

/**
 * A utility function to clean up the Operating System name.
 *
 * @param os - the OS name to clean up.
 * @param pattern - a `RegExp` pattern matching the OS name.
 * @param label - a label for the OS.
 * @returns a cleaned up Operating System name
 *
 * @public
 */
export const cleanupOS = (os: string, pattern?: string, label?: string) => {
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
};

/**
 * Trim and conditionally capitalize string values.
 *
 * @param str - the string to format.
 *
 * @public
 */
export const format = (str: string) => {
  str = trim(str);
  return /^(?:webOS|i(?:OS|P))/.test(str) ? str : capitalize(str);
};

/**
 * Capitalizes a string value.
 *
 * @param str - the string to capitalize.
 * @public
 */
export const capitalize = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Removes leading and trailing whitespace from a string.
 *
 * @param str - the string to trim
 *
 * @public
 */
export const trim = (str: string) => {
  return str.replace(/^ +| +$/g, '');
};

/**
 * Generate a random integer between min and max. If only one parameter is provided
 * minimum is set to 0.
 *
 * @param min - the minimum value
 * @param max - the maximum value
 *
 * @public
 */
export const randomInt = (min: number, max?: number) => Math.floor(randomFloat(min, max));

/**
 * Generate a random float between min and max. If only one parameter is provided
 * minimum is set to 0.
 *
 * @param min - the minimum value
 * @param max - the maximum value
 *
 * @public
 */
export const randomFloat = (min: number, max?: number) => {
  if (!max) {
    max = min;
    min = 0.0;
  }
  return Math.random() * (max - min + 1) + min;
};

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
 * @param str - the string to examine
 */
export const startCase = (str: string) => {
  return str
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, (_, $1, $2) => $1 + ' ' + $2)
    .replace(/(\s|^)(\w)/g, (_, $1, $2) => $1 + $2.toUpperCase());
};

/**
 * Alias for caching function calls
 */
export const memoize = memoizeOne;

interface UniqueIdParams {
  /**
   * The prefix for the unique id
   *
   * @defaultValue ''
   */
  prefix?: string;

  /**
   * The length of the generated ID for the unique id
   *
   * @defaultValue 21
   */
  size?: number;
}

/**
 * Generate a unique id
 *
 * @param params - the destructured params
 * @returns a unique string of specified length
 *
 * @public
 */
export const uniqueId = ({ prefix = '', size }: UniqueIdParams = { prefix: '' }) => {
  return `${prefix}${nano(size)}`;
};

/**
 * Takes a number of elements from the provided array starting from the zero-index
 *
 * @param arr - the array to take from
 * @param num - the number of items to take
 *
 * @public
 */
export const take = <GArray extends any[]>(arr: GArray, num: number) => {
  num = Math.max(Math.min(0, num), num);
  return arr.slice(0, num);
};

/**
 * Alias for picking properties from an object
 */
export const pick = objectPick;

/**
 * Alias for excluding properties from an object
 */
export const omit = objectOmit;

/**
 * A object with flags identifying the current environment.
 *
 * @public
 */
export const environment = {
  /**
   * Verifies that the environment has both a window and window.document
   */
  get isBrowser() {
    return bool(
      typeof window !== 'undefined' &&
        typeof window.document !== 'undefined' &&
        window.navigator &&
        window.navigator.userAgent,
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

  /**
   * True when running on macOS
   */
  get isMac() {
    return environment.isBrowser && /Mac/.test(navigator.platform);
  },

  /**
   * True when running in DEVELOPMENT environment
   */
  get isDevelopment() {
    return process.env.NODE_ENV === 'development';
  },

  /**
   * True when running unit tests
   */
  get isTest() {
    return process.env.NODE_ENV === 'test';
  },

  /**
   * True when running in PRODUCTION environment
   */
  get isProduction() {
    return process.env.NODE_ENV === 'production';
  },
};

/**
 * Shorthand for casting a value to it's boolean equivalent.
 *
 * @param value - the value to transform into a boolean
 *
 * @public
 */
export const bool = (value: unknown) => !!value;

/**
 * A type name matcher for object types
 */
enum TypeName {
  Object = 'Object',
  RegExp = 'RegExp',
  Date = 'Date',
  Promise = 'Promise',
  Error = 'Error',
  Map = 'Map',
  Set = 'Set',
}

/**
 * Alias of toString for non-dom environments
 */
const toString = Object.prototype.toString;

/**
 * Retrieve the object type of a value via it's string reference. This is safer than
 * relying on instanceof checks which fail on cross-frame values.
 *
 * @param value - the object to inspect
 */
const getObjectType = (value: unknown): TypeName | undefined => {
  const objectName = toString.call(value).slice(8, -1);
  return objectName as TypeName;
};

/**
 * A helper for building type predicates
 *
 * @param type -  the name of the type to check for
 * @returns a predicate function for checking the value type
 */
const isOfType = <GType>(type: string) => (value: unknown): value is GType => typeof value === type;

/**
 * Get the object type of passed in value. This avoids the reliance on `instanceof` checks
 * which are subject to cross frame issues as outlined in this link https://bit.ly/1Qds27W
 *
 * @param type - the name of the object type to check for
 *
 * @public
 */
const isObjectOfType = <GType>(type: TypeName) => (value: unknown): value is GType =>
  getObjectType(value) === type;

/**
 * A shorthand method for creating instance of checks.
 */
export const isInstanceOf = <GConstructor>(Constructor: any) => (value: unknown): value is GConstructor =>
  isObject(value) && value instanceof Constructor;

/**
 * Predicate check that value is undefined
 *
 * @param value - the value to check
 *
 * @public
 */
export const isUndefined = isOfType<undefined>('undefined');

/**
 * Predicate check that value is a string
 *
 * @param value - the value to check
 *
 * @public
 */
export const isString = isOfType<string>('string');

/**
 * Predicate check that value is a number
 *
 * @param value - the value to check
 *
 * @public
 */
export const isNumber = isOfType<number>('number');

/**
 * Predicate check that value is a function
 *
 * @param value - the value to check
 *
 * @public
 */
export const isFunction = isOfType<AnyFunction>('function');

/**
 * Predicate check that value is null
 *
 * @param value - the value to check
 *
 * @public
 */
export const isNull = (value: unknown): value is null => value === null;

/**
 * Predicate check that value is a class
 *
 * @deprecated Due to the current build process stripping out classes
 *
 * @param value - the value to check
 *
 * @public
 */
export const isClass = (value: unknown): value is AnyConstructor =>
  isFunction(value) && value.toString().startsWith('class ');

/**
 * Predicate check that value is boolean
 *
 * @param value - the value to check
 *
 * @public
 */
export const isBoolean = (value: unknown): value is boolean => value === true || value === false;

/**
 * Predicate check that value is a symbol
 *
 * @param value - the value to check
 *
 * @public
 */
export const isSymbol = isOfType<symbol>('symbol');

/**
 * Helper function for Number.isInteger check allowing non numbers to be tested
 *
 * @param value - the value to check
 *
 * @public
 */
export const isInteger = (value: unknown): value is number => Number.isInteger(value as number);

/**
 * Helper function for Number.isSafeInteger allowing for unknown values to be tested
 *
 * @param value - the value to check
 *
 * @public
 */
export const isSafeInteger = (value: unknown): value is number => Number.isSafeInteger(value as number);

/**
 * Predicate check for whether passed in value is a plain object
 *
 * @param value - the value to check
 *
 * @public
 */
export const isPlainObject = (value: unknown): value is PlainObject => {
  if (getObjectType(value) !== TypeName.Object) {
    return false;
  }
  const prototype = Object.getPrototypeOf(value);
  return prototype === null || prototype === Object.getPrototypeOf({});
};

/**
 * Utility predicate check that value is either null or undefined
 *
 * @param value - the value to check
 *
 * @public
 */
export const isNullOrUndefined = (value: unknown): value is null | undefined =>
  isNull(value) || isUndefined(value);

/**
 * Predicate check that value is an object
 *
 * @param value - the value to check
 *
 * @public
 */
export const isObject = (value: unknown): value is object =>
  !isNullOrUndefined(value) && (isFunction(value) || isOfType('object')(value));

/**
 * Predicate check that value is a native promise
 *
 * @param value - the value to check
 *
 * @public
 */
export const isNativePromise = (value: unknown): value is Promise<unknown> =>
  isObjectOfType<Promise<unknown>>(TypeName.Promise)(value);

/**
 * Check to see if a value has the built in promise API.
 *
 * @param value - the value to check
 *
 * @public
 */
const hasPromiseAPI = (value: unknown): value is Promise<unknown> =>
  !isNull(value) &&
  (isObject(value) as unknown) &&
  isFunction((value as Promise<unknown>).then) &&
  isFunction((value as Promise<unknown>).catch);

/**
 * Predicate check that value has the promise api implemented
 *
 * @param value - the value to check
 *
 * @public
 */
export const isPromise = (value: unknown): value is Promise<unknown> =>
  isNativePromise(value) || hasPromiseAPI(value);

/**
 * Predicate check that value is a RegExp
 *
 * @param value - the value to check
 *
 * @public
 */
export const isRegExp = isObjectOfType<RegExp>(TypeName.RegExp);

/**
 * Predicate check that value is a date
 *
 * @param value - the value to check
 *
 * @public
 */
export const isDate = isObjectOfType<Date>(TypeName.Date);

/**
 * Predicate check that value is an error
 *
 * @param value - the value to check
 *
 * @public
 */
export const isError = isObjectOfType<Error>(TypeName.Error);

/**
 * Predicate check that value is a map
 *
 * @param value - the value to check
 *
 * @public
 */
export const isMap = (value: unknown): value is Map<unknown, unknown> =>
  isObjectOfType<Map<unknown, unknown>>(TypeName.Map)(value);

/**
 * Predicate check that value is a set
 *
 * @param value - the value to check
 *
 * @public
 */
export const isSet = (value: unknown): value is Set<unknown> =>
  isObjectOfType<Set<unknown>>(TypeName.Set)(value);

/**
 * Predicate check that value is an empty object
 *
 * @param value - the value to check
 *
 * @public
 */
export const isEmptyObject = (value: unknown): value is { [key: string]: never } =>
  isObject(value) && !isMap(value) && !isSet(value) && Object.keys(value).length === 0;

/**
 * Predicate check that value is an empty array
 *
 * @param value - the value to check
 *
 * @public
 */
export const isEmptyArray = (value: unknown): value is never[] => isArray(value) && value.length === 0;

/**
 * Helpful alias
 */
export const isArray = Array.isArray;

/**
 * Clones a plain object using object spread notation
 *
 * @param value - the value to check
 *
 * @public
 */
export const clone = <GObject extends {}>(value: GObject) => {
  if (!isPlainObject(value)) {
    throw new Error('An invalid value was passed into this clone utility. Expected a plain object');
  }
  return { ...value };
};

/**
 * Alias for fast deep equal
 */
export const isEqual = fastDeepEqual;

/**
 * Create a unique array in a non-mutating manner
 *
 * @param array - the array which will be reduced to unique element
 * @return a new array containing only unique elements
 *
 * @public
 */
export const uniqueArray = <GType>(array: GType[]) => {
  const set = new Set(array);
  return Array.from(set);
};

/**
 * Flattens an array
 *
 * @param array
 *
 * @public
 */
export const flattenArray = <GType>(array: any[]): GType[] =>
  array.reduce((a, b) => a.concat(Array.isArray(b) ? flattenArray(b) : b), []);

/**
 * Sometimes doing nothing is the best policy.
 */
export const noop = () => {};
