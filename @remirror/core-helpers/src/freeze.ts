import { invariant } from './core-errors';
import { isObject } from './core-helpers';

/**
 * A freeze method for objects that only runs in development. Helps prevent code
 * that shouldn't be mutated from being mutated will developing.
 */
export const freeze = <Target extends object>(target: Target): Readonly<Target> => {
  if (!__DEV__) {
    return target;
  }

  invariant(isObject(target), '`freeze` only supports objects.');

  return new Proxy(target, {
    set: (_, prop) => {
      invariant(false, `Trying to set value of property (${String(prop)}) of frozen object.`);
    },
  });
};
