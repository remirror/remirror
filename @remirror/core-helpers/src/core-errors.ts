import { BaseError } from 'make-error';

import { ErrorConstant } from '@remirror/core-constants';

import { includes, isString, values } from './core-helpers';

/**
 * Errors have their own URL which will be logged to the console for more easily
 * surfacing issues.
 */
const ERROR_INFORMATION_URL = 'https://docs.remirror.org/errors';

let errorMessageMap: Partial<Record<ErrorConstant, string>> = {};

// This will be removed in a production environment.
if (__DEV__) {
  errorMessageMap = {
    RMR0000: 'Production error. No details available.',
    RMR0001: "An error occurred but we're not quite sure why. 🧐",
    RMR0002: 'You can only pass `extraAttributes` to a node extension or a mark extension.',
    RMR0003: 'This is a custom error, possibly thrown by an external library.',
    RMR0004: 'An error occurred in a function called from the `@remirror/core-helpers` library.',
    RMR0005: 'Mutation of immutable value detected.',
    RMR0006: 'This is an error which should not occur and is internal to the remirror codebase.',
    RMR0007: 'Your editor is missing a required extension.',
    RMR0008:
      'Called a method event at the wrong time. Please make sure getter functions are only called with within the scope of the returned functions. They should not be called in the outer scope of your method.',

    RMR0010:
      'You requested an invalid extension from the preset. Please check the `createExtensions` return method is returning an extension with the requested constructor.',
    RMR0011:
      'Invalid value(s) passed into `Manager` constructor. Only `Presets` and `Extensions` are supported.',
    RMR0012:
      'The commands method which is passed into the `createCommands` function should only be called within the created command function otherwise it will not have access to the other commands.',
    RMR0013: 'You requested an invalid extension from the manager.',
  };
}

/**
 * Checks whether the passed code is an `ErrorConstant`.
 */
const isErrorConstant = (code: unknown): code is ErrorConstant =>
  isString(code) && includes(values(ErrorConstant), code);

/**
 * Create an error message from the provided code.
 */
const createErrorMessage = (code: ErrorConstant, extraMessage?: string) => {
  const message = errorMessageMap[code];
  const prefix = message ? `${message}\n` : '';
  const customMessage = extraMessage ? `${extraMessage}\n` : '';

  return `${prefix}${customMessage}For more information visit ${ERROR_INFORMATION_URL}#${code}`;
};

/**
 * This marks the error as a remirror specific error, with enhanced stack
 * tracing capabilities.
 *
 * @remarks
 *
 * Use this when creating your own public extensions and notifying the user that
 * something has gone wrong.
 */
export class RemirrorError extends BaseError {
  /**
   * A shorthand way of creating an error message.
   */
  public static of(options: RemirrorErrorOptions = {}) {
    return new RemirrorError(options);
  }

  /**
   * The error code used to create this error message.
   */
  public errorCode: ErrorConstant;

  /**
   * The constructor is intentionally kept private to prevent being extended from.
   */
  private constructor({ code, message }: RemirrorErrorOptions = {}) {
    if (isErrorConstant(code)) {
      // If this is a internal code then use the internal error message.
      super(createErrorMessage(code, message));
      this.errorCode = code;

      return;
    }

    const errorCode = ErrorConstant.CUSTOM;

    super(createErrorMessage(errorCode, message));
    this.errorCode = errorCode;
  }
}

/**
 * Throw an error if the condition fails. Strip out error messages for
 * production. Taken from `tiny-invariant`.
 */
export function invariant(condition: unknown, options: RemirrorErrorOptions): asserts condition {
  if (condition) {
    return;
  }

  // When not in 'DEV' strip the message but still throw
  if (!__DEV__) {
    throw RemirrorError.of({ code: ErrorConstant.PROD });
  }

  // When not in production we allow the message to pass through
  // **This block will be removed in production builds**
  throw RemirrorError.of(options);
}

/**
 * The options are only used in a dev environment.
 */
export interface RemirrorErrorOptions {
  /**
   * The code for the built in error.
   */
  code?: ErrorConstant;

  /**
   * The message to add to the error.
   */
  message?: string;
}
