import { BaseError } from 'make-error';

import { ErrorConstant } from '@remirror/core-constants';

import { includes, isString, values } from './core-helpers';

/**
 * Errors have their own URL which will be logged to the console for more easily
 * surfacing issues.
 */
const ERROR_INFORMATION_URL = 'https://docs.remirror.org/errors';

let errorMessageMap: Partial<Record<ErrorConstant, string>> = {};

// This will be stripped away in production.
if (__DEV__) {
  errorMessageMap = {
    RMR0000: 'Production error. No details available.',
    RMR0001: "An error happened but we're not quite sure why.",
    RMR0002: 'You can only pass `extraAttributes` to a node extension or a mark extension.',
    RMR0003: 'This is a custom error, possibly thrown by an external library.',
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
const createErrorMessage = (code: ErrorConstant) => {
  const message = errorMessageMap[code];
  const prefix = message ? `${message}\n` : '';

  return `${prefix}\nFor more information visit ${ERROR_INFORMATION_URL}#${code}`;
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
  public static of(code: ErrorConstant | string) {
    return new RemirrorError(code);
  }

  /**
   * The error code used to create this error message.
   */
  public errorCode: ErrorConstant;

  /**
   * The constructor is intentionally kept private to prevent being extended from.
   */
  private constructor(code: ErrorConstant | string) {
    if (isErrorConstant(code)) {
      // If this is a internal code then use the internal error message.
      super(createErrorMessage(code));
      this.errorCode = code;

      return;
    }

    super(code);
    this.errorCode = ErrorConstant.CUSTOM;
  }
}

/**
 * Throw an error if the condition fails. Strip out error messages for
 * production. Taken from `tiny-invariant`.
 */
export function invariant(condition: unknown, code: ErrorConstant | string): asserts condition {
  if (condition) {
    return;
  }

  // When not in 'DEV' strip the message but still throw
  if (!__DEV__) {
    throw RemirrorError.of(ErrorConstant.PROD);
  }

  // When not in production we allow the message to pass through
  // *This block will be removed in production builds*
  throw RemirrorError.of(code);
}
