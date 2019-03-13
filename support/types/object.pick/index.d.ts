/**
 * Returns a filtered copy of an object with only the specified keys, similar to `_.pick` from lodash / underscore.
 *
 * @param object
 * @param keys
 */
function pick<T extends object, U extends keyof T>(object: T, keys: U[]): Pick<T, U>;

export = pick;
