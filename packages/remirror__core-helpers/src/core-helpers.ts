import { cx as classNames } from '@linaria/core';
import type { ClassName } from '@linaria/core/types/cx';
import deepmerge from 'deepmerge';
import fastDeepEqual from 'fast-deep-equal';
import { BaseError } from 'make-error';
import omit from 'object.omit';
import pick from 'object.pick';
import { __INTERNAL_REMIRROR_IDENTIFIER_KEY__ } from '@remirror/core-constants';
import type {
  AnyConstructor,
  AnyFunction,
  ConditionalExcept,
  Nullable,
  Primitive,
  Shape,
  UnknownShape,
} from '@remirror/types';

type TupleRange<Size extends number> = Size extends Size
  ? number extends Size
    ? number[]
    : _NumberRangeTuple<[], Size>
  : never;
type _NumberRangeTuple<
  Tuple extends readonly unknown[],
  Length extends number,
> = Tuple['length'] extends Length ? Tuple : _NumberRangeTuple<[...Tuple, Tuple['length']], Length>;

/**
 * Type cast an argument. If no type is provided it will default to any.
 *
 * @param arg - the arg to typecast
 */
export function Cast<Type = any>(value: unknown): Type {
  return value as Type;
}

/**
 * Get the key from a given value. Throw an error if the referenced property is
 * `undefined`.
 */
export function assertGet<Value extends object, Key extends keyof Value>(
  value: Value,
  key: Key,
  message?: string,
): Value[Key] {
  const prop = value[key];
  assert(!isUndefined(prop), message);

  return prop;
}

/**
 * Assert the value is `truthy`. Good for defensive programming, especially
 * after enabling `noUncheckedIndexedAccess` in the tsconfig `compilerOptions`.
 */
export function assert(testValue: unknown, message?: string): asserts testValue {
  if (!testValue) {
    throw new AssertionError(message);
  }
}

class AssertionError extends BaseError {
  name = 'AssertionError';
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
  Entry extends [Key, Value],
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
  Value extends Type[Key],
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
export function toString(value: unknown): string {
  return Object.prototype.toString.call(value);
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
function isOfType<Type>(type: string, predicate?: (value: Type) => boolean) {
  return (value: unknown): value is Type => {
    if (typeof value !== type) {
      return false;
    }

    return predicate ? predicate(value as Type) : true;
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
 */
export const isUndefined = isOfType<undefined>('undefined');

/**
 * Predicate check that value is a string
 *
 * @param value - the value to check
 *
 */
export const isString = isOfType<string>('string');

/**
 * Predicate check that value is a number.
 *
 * Also by default doesn't include NaN as a valid number.
 *
 * @param value - the value to check
 *
 */
export const isNumber = isOfType<number>('number', (value) => {
  return !Number.isNaN(value);
});

/**
 * Predicate check that value is a function
 *
 * @param value - the value to check
 *
 */
export const isFunction = isOfType<AnyFunction>('function');

/**
 * Predicate check that value is null
 *
 * @param value - the value to check
 *
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
 */
export function isClass(value: unknown): value is AnyConstructor {
  return isFunction(value) && value.toString().startsWith('class ');
}

/**
 * Predicate check that value is boolean
 *
 * @param value - the value to check
 *
 */
export function isBoolean(value: unknown): value is boolean {
  return value === true || value === false;
}

/**
 * Predicate check that value is a symbol
 *
 * @param value - the value to check
 *
 */
export const isSymbol = isOfType<symbol>('symbol');

/**
 * Helper function for Number.isInteger check allowing non numbers to be tested
 *
 * @param value - the value to check
 *
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
 */
export function isSafeInteger(value: unknown): value is number {
  return Number.isSafeInteger(value as number);
}

/**
 * Predicate check for whether passed in value is a plain object
 *
 * @param value - the value to check
 *
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
 */
export function isNullOrUndefined(value: unknown): value is null | undefined {
  return isNull(value) || isUndefined(value);
}
/**
 * Predicate check that value is an object.
 *
 * @param value - the value to check
 *
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
 */
export function isNativePromise(value: unknown): value is Promise<unknown> {
  return isObjectOfType<Promise<unknown>>(TypeName.Promise)(value);
}

/**
 * Check to see if a value has the built in promise API.
 *
 * @param value - the value to check
 *
 */
const hasPromiseAPI = (value: unknown): value is Promise<unknown> => {
  return !!(
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
 */
export function isPromise(value: unknown): value is Promise<unknown> {
  return isNativePromise(value) || hasPromiseAPI(value);
}

/**
 * Predicate check that value is a RegExp
 *
 * @param value - the value to check
 *
 */
export const isRegExp = isObjectOfType<RegExp>(TypeName.RegExp);

/**
 * Predicate check that value is a date
 *
 * @param value - the value to check
 *
 */
export const isDate = isObjectOfType<Date>(TypeName.Date);

/**
 * Predicate check that value is an error
 *
 * @param value - the value to check
 *
 */
export const isError = isObjectOfType<Error>(TypeName.Error);

/**
 * Predicate check that value is a `Map`
 *
 * @param value - the value to check
 *
 */
export function isMap(value: unknown): value is Map<unknown, unknown> {
  return isObjectOfType<Map<unknown, unknown>>(TypeName.Map)(value);
}

/**
 * Predicate check that value is a `Set`
 *
 * @param value - the value to check
 *
 */
export function isSet(value: unknown): value is Set<unknown> {
  return isObjectOfType<Set<unknown>>(TypeName.Set)(value);
}

/**
 * Predicate check that value is an empty object
 *
 * @param value - the value to check
 *
 */
export function isEmptyObject(value: unknown): boolean {
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
 */
export function isEmptyArray(value: unknown): value is never[] {
  return isArray(value) && value.length === 0;
}

/**
 * Predicate check that value is a non-empty.
 *
 * @param value - the value to check
 *
 */
export function isNonEmptyArray<Item>(value: Item[]): value is [Item, ...Item[]] {
  return isArray(value) && value.length > 0;
}

/**
 * Capitalizes a string value.
 *
 * @param str - the string to capitalize.
 */
export function capitalize(string: string): string {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

/**
 * Trim and conditionally capitalize string values.
 *
 * @param str - the string to format.
 *
 */
export function format(value: string): string {
  value = value.trim();
  return /^(?:webOS|i(?:OS|P))/.test(value) ? value : capitalize(value);
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
): void {
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
 */
export function findMatches(
  text: string,
  regexp: RegExp,
  runWhile: (match: RegExpExecArray | null) => boolean = (match) => !!match,
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
 */
export function cleanupOS(os: string, pattern?: string, label?: string): string {
  if (pattern && label) {
    os = os.replace(new RegExp(pattern, 'i'), label);
  }

  return format(
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
      .split(' on ')[0] ?? '',
  );
}

/**
 * A utility function to check whether the current browser is running on the
 * android platform.
 */
export function isAndroidOS(): boolean {
  const ua = navigator.userAgent;
  const match = new RegExp('\\b' + 'Android' + '(?:/[\\d.]+|[ \\w.]*)', 'i').exec(ua);

  if (!match) {
    return false;
  }

  return cleanupOS(match[0] ?? '', 'Android', 'Android').includes('Android');
}

/**
 * Generate a random float between min and max. If only one parameter is
 * provided minimum is set to 0.
 *
 * @param min - the minimum value
 * @param max - the maximum value
 *
 */
export function randomFloat(min: number, max?: number): number {
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
 */
export function randomInt(min: number, max?: number): number {
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
export function startCase(string: string): string {
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
 * @param prefix - a prefix for the generated id.
 * @returns a unique string of specified length
 *
 */
export function uniqueId(prefix = ''): string {
  return `${prefix}${n().toString(36)}`;
}

/**
 * Takes a number of elements from the provided array starting from the
 * zero-index
 *
 * @param arr - the array to take from
 * @param num - the number of items to take
 *
 */
export function take<Type>(array: Type[], number: number): Type[] {
  number = Math.max(Math.min(0, number), number);
  return array.slice(0, number);
}

/**
 * Remove the undefined values from an object.
 */
export function omitUndefined<Type extends object>(
  object: Type,
): ConditionalExcept<Type, undefined> {
  return omit(object, (value) => !isUndefined(value)) as any;
}

/**
 * Clones a plain object using object spread notation
 *
 * @param value - the value to check
 *
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
 *
 * @returns a new array containing only unique elements (by reference)
 *
 */
export function uniqueArray<Type>(array: Type[], fromStart = false): Type[] {
  const array_ = fromStart ? [...array].reverse() : array;
  const set = new Set(array_);
  return fromStart ? [...set].reverse() : [...set];
}

/**
 * Flattens an array.
 *
 * @param array
 *
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
export function noop(): undefined {
  return;
}

/**
 * A deep merge which only merges plain objects and Arrays. It clones the object
 * before the merge so will not mutate any of the passed in values.
 *
 * To completely remove a key you can use the `Merge` helper class which
 * replaces it's key with a completely new object
 */
export function deepMerge<Type = any>(...objects: Array<object | unknown[]>): Type {
  return deepmerge.all<Type>(objects as any, { isMergeableObject: isPlainObject });
}

interface ClampProps {
  min: number;
  max: number;
  value: number;
}

/**
 * Clamps the value to the provided range.
 */
export function clamp({ min, max, value }: ClampProps): number {
  if (value < min) {
    return min;
  }

  return value > max ? max : value;
}

/**
 * Get the last element of the array.
 */
export function last<Type>(array: Type[]): Type {
  return array[array.length - 1] as Type;
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
 * @param compareFn - compare the two value arguments `a` and `z` - return 0 for
 *                  equal - return number > 0 for a > z - return number < 0 for
 *                  z > a
 */
export function sort<Type>(array: Type[], compareFn: (a: Type, z: Type) => number): Type[] {
  return [...array]
    .map((value, index) => ({ value, index }))
    .sort((a, z) => compareFn(a.value, z.value) || a.index - z.index)
    .map(({ value }) => value);
}

/**
 * Get a property from an object or array by a string path or an array path.
 *
 * @param obj - object to retrieve property from
 * @param path - path to property
 */
export function get<Return>(root: Shape, path: string | string[], defaultValue?: unknown): Return {
  try {
    if (isString(path) && path in root) {
      return (root as any)[path];
    }

    if (isArray(path)) {
      path = `['${path.join("']['")}']`;
    }

    let obj = root;
    path.replace(
      /\[\s*(["'])(.*?)\1\s*]|^\s*(\w+)\s*(?=\.|\[|$)|\.\s*(\w*)\s*(?=\.|\[|$)|\[\s*(-?\d+)\s*]/g,
      (_, __, quotedProp, firstLevel, namedProp, index) => {
        obj = obj[quotedProp || firstLevel || namedProp || index];
        return '';
      },
    );

    return (obj === undefined ? defaultValue : obj) as Return;
  } catch {
    return defaultValue as Return;
  }
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

  assert(key);
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
export function set(
  path: number | string | Array<string | number>,
  obj: Shape,
  value: unknown,
): Shape {
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
export function unset(path: Array<string | number>, target: Shape): Shape {
  const clonedObject = clone(target);
  let value = clonedObject;

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

      return clonedObject;
    }

    if (isPrimitive(item)) {
      return clonedObject;
    }

    item = isArray(item) ? [...item] : { ...item };

    value[key] = item;
    value = item;
  }

  return clonedObject;
}

function makeFunctionForUniqueBy<Item = any>(value: string | string[]) {
  return (item: Item) => {
    return get(item, value as string);
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
export function uniqueBy<Item = any>(
  array: Item[],
  getValue: ((item: Item) => unknown) | string | string[],
  fromStart = false,
): Item[] {
  const unique: Item[] = [];
  const found: Set<unknown> = new Set();

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
 * final position is end. i.e. `length = (end - start) + 1`.
 *
 * If you'd like to create a typed tuple of up to `40` items then pass in a
 * `[number]` tuple as the first argument.
 */
export function range<Size extends number>(size: [Size]): TupleRange<Size>;
export function range(size: number): number[];
export function range(start: number, end: number): number[];
export function range(start: number | [number], end?: number): number[] {
  const startValue = isArray(start) ? start[0] : start;

  if (!isNumber(end)) {
    return Array.from(
      { length: Math.abs(startValue) },
      (_, index) => (startValue < 0 ? -1 : 1) * index,
    );
  }

  if (startValue <= end) {
    return Array.from({ length: end + 1 - startValue }, (_, index) => index + startValue);
  }

  return Array.from({ length: startValue + 1 - end }, (_, index) => -1 * index + startValue);
}

/**
 * Check that a number is within the minimum and maximum bounds of a set of
 * numbers.
 *
 * @param value - the number to test
 */
export function within(value: number, ...rest: Array<number | undefined | null>): boolean {
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
 * @template Obj - the object type
 * @template Property - the property which can be a string | number | symbol
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

export function cx(...classes: ClassName[]): string {
  return uniqueArray(classNames(...classes).split(' ')).join(' ');
}

// The following are forward exports for other libraries. I've structured it
// like this since these libraries are used multiple times within the codebase.

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
