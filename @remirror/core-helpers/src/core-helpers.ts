import { all as merge } from 'deepmerge';
import fastDeepEqual from 'fast-deep-equal';
import memoizeOne from 'memoize-one';
import nano from 'nanoid';
import objectOmit from 'object.omit';
import objectPick from 'object.pick';

type AnyConstructor<GType = unknown> = new (...args: any[]) => GType;
type AnyFunction<GType = any> = (...args: any[]) => GType;
interface PlainObject {
  [key: string]: unknown;
}

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
  let match: RegExpExecArray | null;

  if (!flags.includes('g')) {
    regexp = new RegExp(regexp.source, `g${flags}`);
  }

  do {
    match = regexp.exec(text);
    if (match) {
      results.push(match);
    }
  } while (match);

  regexp.lastIndex = 0;
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

const wordSeparators = /[\s\u2000-\u206F\u2E00-\u2E7F\\'!"#$%&()*+,\-.\/:;<=>?@\[\]^_`{|}~]+/;
const capitals = /[A-Z\u00C0-\u00D6\u00D9-\u00DD]/g;

/**
 * Returns the kebab cased form of a string.
 *
 * Taken from https://github.com/angus-c/just/blob/master/packages/string-kebab-case/index.js
 * kebabCase('the quick brown fox'); // 'the-quick-brown-fox'
 * kebabCase('the-quick-brown-fox'); // 'the-quick-brown-fox'
 * kebabCase('the_quick_brown_fox'); // 'the-quick-brown-fox'
 * kebabCase('theQuickBrownFox'); // 'the-quick-brown-fox'
 * kebabCase('theQuickBrown Fox'); // 'the-quick-brown-fox'
 * kebabCase('thequickbrownfox'); // 'thequickbrownfox'
 * kebabCase('the - quick * brown# fox'); // 'the-quick-brown-fox'
 * kebabCase('theQUICKBrownFox'); // 'the-q-u-i-c-k-brown-fox'
 */
export const kebabCase = (str: string) => {
  // replace capitals with space + lower case equivalent for later parsing
  return str
    .replace(capitals, match => {
      return ' ' + (match.toLowerCase() || match);
    })
    .trim()
    .split(wordSeparators)
    .join('-');
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

export const omitUndefined = (object: PlainObject) => omit(object, value => !isUndefined(value));

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
const isOfType = <GType>(type: string, test?: (value: GType) => boolean) => (
  value: unknown,
): value is GType => (typeof value === type ? (test ? test(value as GType) : true) : false);

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
 * Check if an instance is the direct instance of the provided class.
 */
export const isDirectInstanceOf = <T>(instance: unknown, Constructor: AnyConstructor<T>): instance is T =>
  Object.getPrototypeOf(instance) === Constructor.prototype;

/**
 * A shorthand method for creating instance of checks.
 */
export const isInstanceOf = <GConstructor extends AnyConstructor>(Constructor: GConstructor) => (
  value: unknown,
): value is InstanceType<GConstructor> => isObject(value) && value instanceof Constructor;

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
 * Predicate check that value is a number.
 *
 * Also by default doesn't include NaN as a valid number.
 *
 * @param value - the value to check
 *
 * @public
 */
export const isNumber = isOfType<number>('number', val => !Number.isNaN(val));

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
 * Predicate check that value is a `Map`
 *
 * @param value - the value to check
 *
 * @public
 */
export const isMap = (value: unknown): value is Map<unknown, unknown> =>
  isObjectOfType<Map<unknown, unknown>>(TypeName.Map)(value);

/**
 * Predicate check that value is a `Set`
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
 * Alias the isArray method.
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
 * @param array - the array which will be reduced to its unique elements
 * @param fromStart - when set to true the duplicates will be removed from the
 * beginning of the array. This defaults to false.
 * @return a new array containing only unique elements (by reference)
 *
 * @public
 */
export const uniqueArray = <GType>(array: GType[], fromStart: boolean = false) => {
  const arr = fromStart ? [...array].reverse() : array;
  const set = new Set(arr);
  return fromStart ? Array.from(set).reverse() : Array.from(set);
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

/**
 * Use this to completely overwrite an object when merging.
 *
 * ```ts
 * const source = { awesome: { a: 'a' } }
 * const target = { awesome: { b: 'b' } }
 * const result = deepMerge(source, target) // => { awesome: { a: 'a', b: 'b' } }
 *
 * const overwriteTarget = { awesome: Merge.overwrite({ b: 'b' }) }
 * const overwriteResult = deepMerge(source, overwriteTarget) // => { awesome: { b: 'b' } }
 * ```
 *
 */
export class Merge {
  /**
   * Create an object that will completely replace the key when merging.
   *
   * @param [obj] - the object to replace the key with.
   * When blank an empty object is used.
   */
  public static overwrite<GReturn = any>(obj: PlainObject = {}): GReturn {
    return new Merge(obj) as any;
  }

  /**
   * Sets the key to undefined thus fully deleting the key.
   */
  public static delete() {
    return undefined as any;
  }

  /**
   * This can be used to mimic any object shape.
   */
  [key: string]: any;

  private constructor(obj: PlainObject = {}) {
    Object.keys(obj).forEach(key => {
      this[key] = obj[key];
    });
  }
}

/**
 * A deep merge which only merges plain objects and Arrays. It clones the object
 * before the merge so will not mutate any of the passed in values.
 *
 * To completely remove a key you can use the `Merge` helper class which replaces
 * it's key with a completely new object
 */
export const deepMerge = <GType = any>(...objects: Array<PlainObject | unknown[]>): GType => {
  return merge<GType>(objects as any, { isMergeableObject: isPlainObject });
};

interface ClampParams {
  min: number;
  max: number;
  value: number;
}

/**
 * Clamps the value to the provided range.
 */
export const clamp = ({ min, max, value }: ClampParams): number =>
  value < min ? min : value > max ? max : value;

/**
 * Get the last element of the array.
 */
export const last = <GType>(array: GType[]) => array[array.length - 1];

/**
 * Sorts an array while retaining the original order when the compare method
 * identifies the items as equal.
 *
 * `Array.prototype.sort()` is unstable and so values that are the same
 * will jump around in a non deterministic manner. Here I'm using the index
 * as a fallback. If two elements have the same priority the element with
 * the lower index is placed first hence retaining the original order.
 *
 * @param array - the array to sort
 * @param compareFn - compare the two value arguments `a` and `b`
 *                  - return 0 for equal
 *                  - return number > 0 for a > b
 *                  - return number < 0 for b > a
 */
export const sort = <GType>(array: GType[], compareFn: (a: GType, b: GType) => number) => {
  return [...array]
    .map((value, index) => ({ value, index }))
    .sort((a, b) => compareFn(a.value, b.value) || a.index - b.index)
    .map(({ value }) => value);
};

/**
 * Get a property from an object or array by a string path or an array path.
 *
 * @param path - path to property
 * @param obj - object to retrieve property from
 */
export const get = <GReturn = any>(
  path: string | Array<string | number>,
  obj: any,
  fallback?: any,
): GReturn => {
  if (!path || !path.length) {
    return isUndefined(obj) ? fallback : obj;
  }

  if (isString(path)) {
    path = path.split('.');
  }

  for (let ii = 0, len = path.length; ii < len && obj; ++ii) {
    if (!isPlainObject(obj) && !isArray(obj)) {
      return fallback;
    }

    obj = (obj as any)[path[ii]];
  }

  return isUndefined(obj) ? fallback : obj;
};

export * from 'throttle-debounce';

/**
 * Create a unique array of objects from a getter function
 * or a property list.
 *
 * @param array - the array to extract unique values from
 * @param getValue - a getter function or a string with the path to
 * the item that is being used as a a test for uniqueness.
 * @param fromStart - when true will remove duplicates from the start
 * rather than from the end
 *
 * ```ts
 * import { uniqueBy } from '@remirror/core-helpers';
 *
 * const values = uniqueBy([{ id: 'a', value: 'Awesome' }, { id: 'a', value: 'ignored' }], item => item.id);
 * console.log(values) // => [{id: 'a', value: 'Awesome'}]
 *
 * const byKey = uniqueBy([{ id: 'a', value: 'Awesome' }, { id: 'a', value: 'ignored' }], 'id')
 * // Same as above
 * ```
 */
export const uniqueBy = <GItem extends object = any, GKey = any>(
  array: GItem[],
  getValue: ((item: GItem) => GKey) | string | Array<string | number>,
  fromStart = false,
): GItem[] => {
  const unique: GItem[] = [];
  const found: Set<GKey> = new Set();
  const makeFn = (val: string | Array<string | number>) => (item: GItem) => get<GKey>(val, item);
  const getter = isFunction(getValue) ? getValue : makeFn(getValue);
  const arr = fromStart ? [...array].reverse() : array;

  for (const item of arr) {
    const value = getter(item);
    if (!found.has(value)) {
      found.add(value);
      unique.push(item);
    }
  }

  return fromStart ? unique.reverse() : unique;
};

/**
 * A typesafe implementation of `Object.entries`
 *
 * Taken from https://github.com/biggyspender/ts-entries/blob/master/src/ts-entries.ts
 */
export const entries = <
  GType extends object,
  GKey extends Extract<keyof GType, string>,
  GValue extends GType[GKey],
  GEntry extends [GKey, GValue]
>(
  obj: GType,
): GEntry[] => Object.entries(obj) as GEntry[];

/**
 * A typesafe implementation of `Object.keys`
 */
export const keys = <GObj extends object, GKey extends Extract<keyof GObj, string>>(obj: GObj): GKey[] =>
  Object.keys(obj) as GKey[];

/**
 * Create a range from start to end.
 *
 * If only start is provided it creates an array of the size provided.
 * if start and end are provided it creates an array who's first position is
 * start and final position is end. i.e. `length = (end - start) + 1`
 */
export const range = (start: number, end?: number) => {
  return !isNumber(end)
    ? Array.from({ length: Math.abs(start) }, (_, index) => (start < 0 ? -1 : 1) * index)
    : start <= end
    ? Array.from({ length: end + 1 - start }, (_, index) => index + start)
    : Array.from({ length: start + 1 - end }, (_, index) => -1 * index + start);
};
