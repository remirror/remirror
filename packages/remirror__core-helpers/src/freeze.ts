/// <reference types="node" />

import { ErrorConstant } from '@remirror/core-constants';

import { invariant } from './core-errors';
import { isArray, isObject } from './core-helpers';

/**
 * A freeze method for objects that only runs in development. Helps prevent code
 * that shouldn't be mutated from being mutated during development.
 *
 * @remarks
 *
 * This function passes the value back unchanged when in a production
 * environment. It's purpose is to help prevent bad practice while developing
 * by avoiding mutation of values that shouldn't be mutated.
 */
export function freeze<Target extends object>(
  target: Target,
  options: FreezeOptions = {},
): Readonly<Target> {
  if (process.env.NODE_ENV === 'production') {
    return target;
  }

  invariant(isObject(target) || isArray(target), {
    message: '`freeze` only supports objects and arrays.',
    code: ErrorConstant.CORE_HELPERS,
  });

  return new Proxy(target, {
    get: (target, prop, receiver) => {
      invariant(prop in target || !options.requireKeys, {
        message: `The prop: '${prop.toString()}' you are trying to access does not yet exist on the target.`,
      });

      return Reflect.get(target, prop, receiver);
    },
    set: (_, prop) => {
      invariant(false, {
        message: `It seems you're trying to set the value of the property (${String(
          prop,
        )}) on a frozen object. For your protection this object does not allow direct mutation.`,
        code: ErrorConstant.MUTATION,
      });
    },
  });
}

interface FreezeOptions {
  /**
   * Whether the key that is being accessed should exist on the target object.
   *
   * @default undefined
   */
  requireKeys?: boolean;
}
