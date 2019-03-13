type AnyFunction<R = any> = (...args: any[]) => R;

/**
 * Returns a new function that, when invoked, invokes `func` at most once per `wait` milliseconds.
 *
 * @param {AnyFunction} func Function to wrap.
 * @param {Number} wait Number of milliseconds that must elapse between `func` invocations.
 * @return {AnyFunction} A new function that wraps the `func` function passed in.
 */
function throttle<GFunction extends AnyFunction>(fn: GFunction, wait: number): GFunction;

export = throttle;
