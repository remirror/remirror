import { ErrorConstant } from '@remirror/core-constants';

import { invariant } from './core-errors';
import { isObject } from './core-helpers';

/**
 * A freeze method for objects that only runs in development. Helps prevent code
 * that shouldn't be mutated from being mutated will developing.
 *
 * @remarks
 *
 * This function passes the value back unchanged when in a production
 * environment. It's purpose is to help prevent bad practice while developing
 * by avoiding mutation of values that shouldn't be mutated.
 */
export const freeze = <Target extends object>(target: Target): Readonly<Target> => {
  if (!__DEV__) {
    return target;
  }

  invariant(isObject(target), {
    message: '`freeze` only supports objects.',
    code: ErrorConstant.CORE_HELPERS,
  });

  return new Proxy(target, {
    set: (_, prop) => {
      invariant(false, {
        message: `It seems you're trying to set the value of the property (${String(
          prop,
        )}) on a frozen object. For your protection this object does not allow direct mutation.`,
        code: ErrorConstant.MUTATION,
      });
    },
  });
};
