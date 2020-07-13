import deepmerge from 'deepmerge';
import fastDeepEqual from 'fast-deep-equal';
import omit from 'object.omit';
import pick from 'object.pick';
import type { Primitive } from 'type-fest';

import type { RemirrorIdentifier } from '@remirror/core-constants';
import { __INTERNAL_REMIRROR_IDENTIFIER_KEY__ } from '@remirror/core-constants';
import type {
  AnyConstructor,
  AnyFunction,
  Nullable,
  Predicate,
  RemirrorIdentifierShape,
  Shape,
  UnknownShape,
} from '@remirror/core-types';

/**
 * Any falsy type.
 */
type Falsy = false | 0 | '' | null | undefined;

/**
 * Type cast an argument. If no type is provided it will default to any.
 *
 * @param arg - the arg to typecast
 */
export function Cast<Type = any>(argument: any): Type {
  return argument;
}

/**
 * A typesafe implementation of `Object.entries()`
 *
 * Taken from
 * https://github.com/biggyspender/ts-entries/blob/master/src/ts-entries.ts
 */
export function entries<
  Type extends object,
  Key extends Extract<keyof Type, string>,
  Value extends Type[Key],
  Entry extends [Key, Value]
>(value: Type): Entry[] {
  return Object.entries(value) as Entry[];
}

/**
 * A typesafe implementation of `Object.keys()`
 */
export function keys<Type extends object, Key extends Extract<keyof Type, string>>(
  value: Type,
): Key[] {
  return Object.keys(value) as Key[];
}

/**
 * A typesafe implementation of `Object.values()`
 */
export function values<
  Type extends object,
  Key extends Extract<keyof Type, string>,
  Value extends Type[Key]
>(value: Type): Value[] {
  return Object.values(value) as Value[];
}

/**
 * A more lenient typed version of `Array.prototype.includes` which allow less
 * specific types to be checked.
 */
export function includes<Type>(
  array: Type[] | readonly Type[],
  item: unknown,
  fromIndex?: number,
): item is Type {
  return array.includes(item as Type, fromIndex);
}

/**
 * Creates an object with the null prototype.
 *
 * @param value - the object to create
 */
export function object<Type extends object>(value?: Type): Type {
  return Object.assign(Object.create(null), value);
}

/**
 * Shorthand for casting a value to it's boolean equivalent.
 *
 * @param value - the value to transform into a boolean
 *
 * @public
 */
export function bool<Value>(value: Value): value is Exclude<Value, Falsy> {
  return !!value;
}

/**
 * A type name matcher for object types.
 *
 * @private
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
 * Alias of toString for non-dom environments.
 *
 * This is a safe way of calling `toString` on objects created with
 * `Object.create(null)`.
 */
export function toString(value: unknown) {
  return Object.prototype.toString.call(value);
}

/**
 * Negates a predicate check.
 *
 * @remarks
 *
 * Unfortunately it doesn't seem possible to automatically negate the predicate
 * with typescript.
 */
export function not<Type>(predicate: Predicate<Type>) {
  return (a: unknown) => !predicate(a);
}

/**
 * Retrieve the object type of a value via it's string reference. This is safer
 * than relying on instanceof checks which fail on cross-frame values.
 *
 * @param value - the object to inspect
 */
function getObjectType(value: unknown): TypeName | undefined {
  const objectName = toString(value).slice(8, -1);

  return objectName as TypeName;
}

/**
 * A helper for building type predicates
 *
 * @param type -  the name of the type to check for
 * @returns a predicate function for checking the value type
 */
function isOfType<Type>(type: string, test?: (value: Type) => boolean) {
  return (value: unknown): value is Type => {
    if (typeof value !== type) {
      return false;
    }

    return test ? test(value as Type) : true;
  };
}

/**
 * Get the object type of passed in value. This avoids the reliance on
 * `instanceof` checks which are subject to cross frame issues as outlined in
 * this link https://bit.ly/1Qds27W
 *
 * @param type - the name of the object type to check for
 *
 * @private
 */
function isObjectOfType<Type>(type: TypeName) {
  return (value: unknown): value is Type => getObjectType(value) === type;
}

/**
 * Check if an instance is the direct instance of the provided class.
 */
export function isDirectInstanceOf<Type>(
  instance: unknown,
  Constructor: AnyConstructor<Type>,
): instance is Type {
  return Object.getPrototypeOf(instance) === Constructor.prototype;
}

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
export const isNumber = isOfType<number>('number', (value) => {
  return !Number.isNaN(value);
});

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
export function isNull(value: unknown): value is null {
  return value === null;
}

/**
 * Predicate check that value is a class
 *
 * @deprecated Due to the current build process stripping out classes
 *
 * @param value - the value to check
 *
 * @public
 */
export function isClass(value: unknown): value is AnyConstructor {
  return isFunction(value) && value.toString().startsWith('class ');
}

/**
 * Predicate check that value is boolean
 *
 * @param value - the value to check
 *
 * @public
 */
export function isBoolean(value: unknown): value is boolean {
  return value === true || value === false;
}

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
export function isInteger(value: unknown): value is number {
  return Number.isInteger(value as number);
}

/**
 * Helper function for Number.isSafeInteger allowing for unknown values to be
 * tested
 *
 * @param value - the value to check
 *
 * @public
 */
export function isSafeInteger(value: unknown): value is number {
  return Number.isSafeInteger(value as number);
}

/**
 * Predicate check for whether passed in value is a plain object
 *
 * @param value - the value to check
 *
 * @public
 */
export function isPlainObject<Type = unknown>(value: unknown): value is UnknownShape<Type> {
  if (getObjectType(value) !== TypeName.Object) {
    return false;
  }

  const prototype = Object.getPrototypeOf(value);

  return prototype === null || prototype === Object.getPrototypeOf({});
}

/**
 * Predicate check for whether passed in value is a primitive value
 */
export function isPrimitive(value: unknown): value is Primitive {
  return value == null || /^[bns]/.test(typeof value);
}

/**
 * Utility predicate check that value is either null or undefined
 *
 * @param value - the value to check
 *
 * @public
 */
export function isNullOrUndefined(value: unknown): value is null | undefined {
  return isNull(value) || isUndefined(value);
}
/**
 * Predicate check that value is an object.
 *
 * @param value - the value to check
 *
 * @public
 */
export function isObject<Type extends Shape>(value: unknown): value is Type {
  return !isNullOrUndefined(value) && (isFunction(value) || isOfType('object')(value));
}

/**
 * A shorthand method for creating instance of checks.
 */
export function isInstanceOf<Constructor extends AnyConstructor>(Constructor: Constructor) {
  return (value: unknown): value is InstanceType<Constructor> =>
    isObject(value) && value instanceof Constructor;
}

/**
 * Predicate check that value is a native promise
 *
 * @param value - the value to check
 *
 * @public
 */
export function isNativePromise(value: unknown): value is Promise<unknown> {
  return isObjectOfType<Promise<unknown>>(TypeName.Promise)(value);
}

/**
 * Check to see if a value has the built in promise API.
 *
 * @param value - the value to check
 *
 * @public
 */
const hasPromiseAPI = (value: unknown): value is Promise<unknown> => {
  return (
    !isNull(value) &&
    (isObject(value) as unknown) &&
    isFunction((value as Promise<unknown>).then) &&
    isFunction((value as Promise<unknown>).catch)
  );
};

/**
 * Predicate check that value has the promise api implemented
 *
 * @param value - the value to check
 *
 * @public
 */
export function isPromise(value: unknown): value is Promise<unknown> {
  return isNativePromise(value) || hasPromiseAPI(value);
}

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
export function isMap(value: unknown): value is Map<unknown, unknown> {
  return isObjectOfType<Map<unknown, unknown>>(TypeName.Map)(value);
}

/**
 * Predicate check that value is a `Set`
 *
 * @param value - the value to check
 *
 * @public
 */
export function isSet(value: unknown): value is Set<unknown> {
  return isObjectOfType<Set<unknown>>(TypeName.Set)(value);
}

/**
 * Predicate check that value is an empty object
 *
 * @param value - the value to check
 *
 * @public
 */
export function isEmptyObject(value: unknown) {
  return isObject(value) && !isMap(value) && !isSet(value) && Object.keys(value).length === 0;
}

/**
 * Alias the isArray method.
 */
export const isArray = Array.isArray;

/**
 * Predicate check that value is an empty array
 *
 * @param value - the value to check
 *
 * @public
 */
export function isEmptyArray(value: unknown) {
  return isArray(value) && value.length === 0;
}

/**
 * Identifies the value as having a remirror identifier. This is the core
 * predicate check for the remirror library.
 *
 * @param value - the value to be checked
 *
 * @internal
 */
export const isRemirrorType = (value: unknown): value is RemirrorIdentifierShape =>
  isObject<RemirrorIdentifierShape>(value);

/**
 * Checks that the provided remirror shape is of a given type.
 *
 * @param value - any remirror shape
 * @param type - the remirror identifier type to check for
 *
 * @internal
 */
export function isIdentifierOfType(
  value: RemirrorIdentifierShape,
  type: RemirrorIdentifier | RemirrorIdentifier[],
): boolean {
  return isArray(type)
    ? includes(type, value[__INTERNAL_REMIRROR_IDENTIFIER_KEY__])
    : type === value[__INTERNAL_REMIRROR_IDENTIFIER_KEY__];
}

/**
 * Capitalizes a string value.
 *
 * @param str - the string to capitalize.
 * @public
 */
export function capitalize(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

/**
 * Removes leading and trailing whitespace from a string.
 *
 * @param str - the string to trim
 *
 * @public
 */
export function trim(string: string) {
  return string.replace(/^ +| +$/g, '');
}

/**
 * Trim and conditionally capitalize string values.
 *
 * @param str - the string to format.
 *
 * @public
 */
export function format(string: string) {
  string = trim(string);
  return /^(?:webOS|i(?:OS|P))/.test(string) ? string : capitalize(string);
}

/**
 * Calls a function if defined and provides compile time type checking for the
 * passed in parameters.
 *
 * @param fn - the function to call if it exists
 * @param args - the rest of the parameters with types
 */
export function callIfDefined<Method extends AnyFunction>(
  fn: Nullable<Method>,
  ...args: Parameters<Method>
) {
  if (isFunction(fn)) {
    fn(...args);
  }
}

/**
 * Finds all the regex matches for a string
 *
 * @param text - the text to check against
 * @param regexp - the regex (which should include a 'g' flag)
 *
 * @public
 */
export function findMatches(
  text: string,
  regexp: RegExp,
  runWhile: (match: RegExpExecArray | null) => boolean = (match) => bool(match),
): RegExpExecArray[] {
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
  } while (runWhile(match));

  regexp.lastIndex = 0;
  return results;
}

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
export function cleanupOS(os: string, pattern?: string, label?: string) {
  if (pattern && label) {
    os = os.replace(new RegExp(pattern, 'i'), label);
  }

  const value = format(
    os
      .replace(/ ce$/i, ' CE')
      .replace(/\bhpw/i, 'web')
      .replace(/\bMacintosh\b/, 'Mac OS')
      .replace(/_powerpc\b/i, ' OS')
      .replace(/\b(os x) [^\d ]+/i, '$1')
      .replace(/\bMac (OS X)\b/, '$1')
      .replace(/\/(\d)/, ' $1')
      .replace(/_/g, '.')
      .replace(/(?: bepc|[ .]*fc[\d .]+)$/i, '')
      .replace(/\bx86\.64\b/gi, 'x86_64')
      .replace(/\b(Windows Phone) OS\b/, '$1')
      .replace(/\b(Chrome OS \w+) [\d.]+\b/, '$1')
      .split(' on ')[0],
  );

  return value;
}

/**
 * A utility function to check whether the current browser is running on the
 * android platform.
 * @public
 */
export function isAndroidOS() {
  const ua = navigator.userAgent;
  const match = new RegExp('\\b' + 'Android' + '(?:/[\\d.]+|[ \\w.]*)', 'i').exec(ua);

  if (!match) {
    return false;
  }

  return cleanupOS(match[0], 'Android', 'Android').includes('Android');
}

/**
 * Generate a random float between min and max. If only one parameter is
 * provided minimum is set to 0.
 *
 * @param min - the minimum value
 * @param max - the maximum value
 *
 * @public
 */
export function randomFloat(min: number, max?: number) {
  if (!max) {
    max = min;
    min = 0;
  }

  return Math.random() * (max - min + 1) + min;
}

/**
 * Generate a random integer between min and max. If only one parameter is
 * provided minimum is set to 0.
 *
 * @param min - the minimum value
 * @param max - the maximum value
 *
 * @public
 */
export function randomInt(min: number, max?: number) {
  return Math.floor(randomFloat(min, max));
}

/**
 * Converts a string, including strings in camelCase or snake_case, into Start
 * Case (a variant of Title case where all words start with a capital letter),
 * it keeps original single quote and hyphen in the word.
 *
 *   'management_companies' to 'Management Companies' 'managementCompanies' to
 *   'Management Companies' `hell's kitchen` to `Hell's Kitchen` `co-op` to
 *   `Co-op`
 *
 * @param str - the string to examine
 */
export function startCase(string: string) {
  return string
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, (_, $1: string, $2: string) => `${$1} ${$2}`)
    .replace(/(\s|^)(\w)/g, (_, $1: string, $2: string) => `${$1}${$2.toUpperCase()}`);
}

/**
 * Returns a number that is unique during the runtime of this code.
 */
function n() {
  const time = Date.now();
  const last = n.last || time;
  return (n.last = time > last ? time : last + 1);
}

n.last = 0;

/**
 * Generate a unique id
 *
 * @param params - the destructured params
 * @returns a unique string of specified length
 *
 * @public
 */
export function uniqueId(prefix = '') {
  return `${prefix}${n().toString(36)}`;
}

/**
 * Takes a number of elements from the provided array starting from the
 * zero-index
 *
 * @param arr - the array to take from
 * @param num - the number of items to take
 *
 * @public
 */
export function take<Type extends any[]>(array: Type, number: number) {
  number = Math.max(Math.min(0, number), number);
  return array.slice(0, number);
}

export function omitUndefined(object: UnknownShape) {
  return omit(object, (value) => !isUndefined(value));
}

/**
 * Clones a plain object using object spread notation
 *
 * @param value - the value to check
 *
 * @public
 */
export function clone<Type extends object>(value: Type): Type {
  if (!isPlainObject(value)) {
    throw new Error('An invalid value was passed into this clone utility. Expected a plain object');
  }

  return { ...value };
}

/**
 * Shallow clone an object while preserving it's getters and setters. This is a
 * an alternative to the spread clone.
 */
export function shallowClone<Type extends object>(value: Type): Type {
  const clone = Object.create(Object.getPrototypeOf(value));
  const descriptors = Object.getOwnPropertyDescriptors(value);
  Object.defineProperties(clone, descriptors);

  return clone;
}

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
export function uniqueArray<Type>(array: Type[], fromStart = false) {
  const array_ = fromStart ? [...array].reverse() : array;
  const set = new Set(array_);
  return fromStart ? [...set].reverse() : [...set];
}

/**
 * Flattens an array.
 *
 * @param array
 *
 * @public
 */
export function flattenArray<Type>(array: any[]): Type[] {
  const flattened: any[] = [];

  for (const item of array) {
    const itemsToInsert = isArray(item) ? flattenArray(item) : [item];
    flattened.push(...itemsToInsert);
  }

  return flattened;
}

/**
 * noop is a shorthand way of saying `No Operation` and is a function that does
 * nothing.
 *
 * And Sometimes doing nothing is the best policy.
 */
export function noop() {}

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
   * @param [obj] - the object to replace the key with. When blank an empty
   * object is used.
   */
  static overwrite<Return = any>(object_: UnknownShape = object()): Return {
    return new Merge(object_) as any;
  }

  /**
   * Sets the key to undefined thus fully deleting the key.
   */
  static delete() {
    return undefined as any;
  }

  private constructor(object_: UnknownShape = object()) {
    keys(object_).forEach((key) => {
      this[key] = object_[key];
    });
  }
}

export interface Merge {
  /**
   * This can be used to mimic any object shape.
   */
  [key: string]: unknown;
}

/**
 * A deep merge which only merges plain objects and Arrays. It clones the object
 * before the merge so will not mutate any of the passed in values.
 *
 * To completely remove a key you can use the `Merge` helper class which
 * replaces it's key with a completely new object
 */
export function deepMerge<Type = any>(...objects: Array<UnknownShape | unknown[]>): Type {
  return deepmerge.all<Type>(objects as any, { isMergeableObject: isPlainObject });
}

interface ClampParameter {
  min: number;
  max: number;
  value: number;
}

/**
 * Clamps the value to the provided range.
 */
export function clamp({ min, max, value }: ClampParameter) {
  if (value < min) {
    return min;
  }

  return value > max ? max : value;
}

/**
 * Get the last element of the array.
 */
export function last<Type>(array: Type[]) {
  return array[array.length - 1];
}

/**
 * Sorts an array while retaining the original order when the compare method
 * identifies the items as equal.
 *
 * `Array.prototype.sort()` is unstable and so values that are the same will
 * jump around in a non deterministic manner. Here I'm using the index as a
 * fallback. If two elements have the same priority the element with the lower
 * index is placed first hence retaining the original order.
 *
 * @param array - the array to sort
 * @param compareFn - compare the two value arguments `a` and `b` - return 0 for
 *                  equal - return number > 0 for a > b - return number < 0 for
 *                  b > a
 */
export function sort<Type>(array: Type[], compareFn: (a: Type, b: Type) => number) {
  return [...array]
    .map((value, index) => ({ value, index }))
    .sort((a, b) => compareFn(a.value, b.value) || a.index - b.index)
    .map(({ value }) => value);
}

/**
 * Get a property from an object or array by a string path or an array path.
 *
 * @param path - path to property
 * @param obj - object to retrieve property from
 */
export function get<Return = any>(
  path: string | Array<string | number>,
  obj: any,
  fallback?: any,
): Return {
  if (!path || isEmptyArray(path)) {
    return isUndefined(obj) ? fallback : obj;
  }

  if (isString(path)) {
    path = path.split('.');
  }

  for (let ii = 0, length_ = path.length; ii < length_ && obj; ++ii) {
    if (!isPlainObject(obj) && !isArray(obj)) {
      return fallback;
    }

    obj = (obj as any)[path[ii]];
  }

  return isUndefined(obj) ? fallback : obj;
}

function setPropInternal<Type extends object = any>(
  path: Array<string | number>,
  obj: any,
  value: any,
  index: number,
): Type {
  if (path.length === index) {
    return value;
  }

  // Create things as we go down if they don't exist
  obj = obj || {};

  const key = path[index];
  return setClone(obj, key, setPropInternal(path, obj[key], value, ++index));
}

function setClone(obj: any, key: string | number, value: any) {
  const newObj = clone(obj);
  newObj[key] = value;
  return newObj;
}

/**
 * Set the value of a given path for the provided object. Does not mutate the
 * original object.
 */
export function set(path: number | string | Array<string | number>, obj: Shape, value: unknown) {
  if (isNumber(path)) {
    return setClone(obj, path, value);
  }

  if (isString(path)) {
    path = path.split('.');
  }

  return setPropInternal(path, obj, value, 0);
}

/**
 * Unset the value of a given path within an object.
 */
export function unset(path: Array<string | number>, obj: Shape) {
  const newObj = clone(obj);
  let value = newObj;

  for (const [index, key] of path.entries()) {
    const shouldDelete = index >= path.length - 1;
    let item = value[key];

    if (shouldDelete) {
      if (isArray(value)) {
        const indexKey = Number.parseInt(key.toString(), 10);

        if (isNumber(indexKey)) {
          value.splice(indexKey, 1);
        }
      } else {
        Reflect.deleteProperty(value, key);
      }

      return newObj;
    }

    if (isPrimitive(item)) {
      return newObj;
    }

    if (isArray(item)) {
      item = [...item];
    } else {
      item = { ...item };
    }

    value[key] = item;
    value = item;
  }

  return newObj;
}

function makeFunctionForUniqueBy<Item = any, Key = any>(value: string | Array<string | number>) {
  return (item: Item) => {
    return get<Key>(value, item);
  };
}

/**
 * Create a unique array of objects from a getter function or a property list.
 *
 * @param array - the array to extract unique values from
 * @param getValue - a getter function or a string with the path to the item
 * that is being used as a a test for uniqueness.
 * @param fromStart - when true will remove duplicates from the start rather
 * than from the end
 *
 * ```ts
 * import { uniqueBy } from '@remirror/core-helpers';
 *
 * const values = uniqueBy([{ id: 'a', value: 'Awesome' }, { id: 'a', value: 'ignored' }], item => item.id);
 * log(values) // => [{id: 'a', value: 'Awesome'}]
 *
 * const byKey = uniqueBy([{ id: 'a', value: 'Awesome' }, { id: 'a', value: 'ignored' }], 'id')
 * // Same as above
 * ```
 */
export function uniqueBy<Item = any, Key = any>(
  array: Item[],
  getValue: ((item: Item) => Key) | string | Array<string | number>,
  fromStart = false,
): Item[] {
  const unique: Item[] = [];
  const found: Set<Key> = new Set();

  const getter = isFunction(getValue) ? getValue : makeFunctionForUniqueBy(getValue);
  const list = fromStart ? [...array].reverse() : array;

  for (const item of list) {
    const value = getter(item);

    if (!found.has(value)) {
      found.add(value);
      unique.push(item);
    }
  }

  return fromStart ? unique.reverse() : unique;
}

/**
 * Create a range from start to end.
 *
 * If only start is provided it creates an array of the size provided. if start
 * and end are provided it creates an array who's first position is start and
 * final position is end. i.e. `length = (end - start) + 1`
 */
export function range(start: number, end?: number) {
  if (!isNumber(end)) {
    return Array.from({ length: Math.abs(start) }, (_, index) => (start < 0 ? -1 : 1) * index);
  }

  if (start <= end) {
    return Array.from({ length: end + 1 - start }, (_, index) => index + start);
  }

  return Array.from({ length: start + 1 - end }, (_, index) => -1 * index + start);
}

/**
 * Check that a number is within the minimum and maximum bounds of a set of
 * numbers.
 *
 * @param value - the number to test
 */
export function within(value: number, ...rest: Array<number | undefined | null>) {
  const numbers: number[] = rest.filter<number>(isNumber);
  return value >= Math.min(...numbers) && value <= Math.max(...numbers);
}

/**
 * Safe implementation of hasOwnProperty with typechecking.
 *
 * @remarks
 *
 * See {@link https://eslint.org/docs/rules/no-prototype-builtins}
 *
 * @param obj - the object to check
 * @param key - the property to check
 *
 * @typeParam Obj - the object type
 * @typeParam Property - the property which can be a string | number | symbol
 */
export function hasOwnProperty<Obj extends object, Property extends string | number | symbol>(
  object_: Obj,
  key: Property,
): object_ is Property extends keyof Obj ? Obj : Obj & { Key: unknown } {
  return Object.prototype.hasOwnProperty.call(object_, key);
}

/**
 * Helper for getting an array from a function or array.
 */
export function getLazyArray<Type>(value: Type[] | (() => Type[])): Type[] {
  if (isFunction(value)) {
    return value();
  }

  return value;
}

// Forwarded exports

export {
  camelCase,
  capitalCase,
  constantCase,
  kebabCase,
  pascalCase,
  pathCase,
  snakeCase,
  spaceCase,
} from 'case-anything';
export { debounce, throttle } from 'throttle-debounce';
export { omit, pick };
