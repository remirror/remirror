type AnyFunction<R = any> = (...args: any[]) => R;

/**
 * Check if a value is a function
 *
 * @param fn
 */
function isFn(fn: unknown): fn is AnyFunction;

export = isFn;
