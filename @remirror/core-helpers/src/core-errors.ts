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
if (process.env.NODE !== 'production') {
  errorMessageMap = {
    [ErrorConstant.PROD]: 'Production error. No details available.',
    [ErrorConstant.UNKNOWN]: "An error occurred but we're not quite sure why. 🧐",
    [ErrorConstant.INVALID_COMMAND_ARGUMENTS]:
      'The arguments passed to the command method were invalid.',
    [ErrorConstant.CUSTOM]: 'This is a custom error, possibly thrown by an external library.',
    [ErrorConstant.CORE_HELPERS]:
      'An error occurred in a function called from the `@remirror/core-helpers` library.',
    [ErrorConstant.MUTATION]: 'Mutation of immutable value detected.',
    [ErrorConstant.INTERNAL]:
      'This is an error which should not occur and is internal to the remirror codebase.',
    [ErrorConstant.MISSING_REQUIRED_EXTENSION]: 'Your editor is missing a required extension.',
    [ErrorConstant.MANAGER_PHASE_ERROR]:
      'Called a method event at the wrong time. Please make sure getter functions are only called with within the scope of the returned functions. They should not be called in the outer scope of your method.',
    [ErrorConstant.INVALID_PRESET_EXTENSION]:
      'You requested an invalid extension from the preset. Please check the `createExtensions` return method is returning an extension with the requested constructor.',
    [ErrorConstant.INVALID_MANAGER_ARGUMENTS]:
      'Invalid value(s) passed into `Manager` constructor. Only `Presets` and `Extensions` are supported.',
    [ErrorConstant.COMMANDS_CALLED_IN_OUTER_SCOPE]:
      'The `commands` or `dispatch` method which is passed into the `create*` method should only be called within returned method since it relies on an active view (not present in the outer scope).',
    [ErrorConstant.HELPERS_CALLED_IN_OUTER_SCOPE]:
      'The `helpers` method which is passed into the ``create*` method should only be called within returned method since it relies on an active view (not present in the outer scope).',
    [ErrorConstant.INVALID_MANAGER_EXTENSION]:
      'You requested an invalid extension from the manager.',
    [ErrorConstant.INVALID_MANAGER_PRESET]:
      'The user requested an invalid preset from the manager.',
    [ErrorConstant.DUPLICATE_COMMAND_NAMES]:
      'Command method names must be unique within the editor.',
    [ErrorConstant.DUPLICATE_HELPER_NAMES]: 'Helper method names must be unique within the editor.',
    [ErrorConstant.NON_CHAINABLE_COMMAND]: 'Attempted to chain a non chainable command.',
    [ErrorConstant.INVALID_NAME]: 'An invalid name was used for the extension.',
    [ErrorConstant.EXTENSION]:
      'An error occurred within an extension. More details should be made available.',
  };
}

/**
 * Checks whether the passed code is an `ErrorConstant`.
 */
function isErrorConstant(code: unknown): code is ErrorConstant {
  return isString(code) && includes(values(ErrorConstant), code);
}

/**
 * Create an error message from the provided code.
 */
function createErrorMessage(code: ErrorConstant, extraMessage?: string) {
  const message = errorMessageMap[code];
  const prefix = message ? `${message}\n` : '';
  const customMessage = extraMessage ? `${extraMessage}\n` : '';

  return `${prefix}${customMessage}For more information visit ${ERROR_INFORMATION_URL}#${code}`;
}

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
 * production. Adapted from `tiny-invariant`.
 */
export function invariant(condition: unknown, options: RemirrorErrorOptions): asserts condition {
  if (condition) {
    return;
  }

  // When not in 'DEV' strip the message but still throw
  if (process.env.NODE === 'production') {
    throw RemirrorError.of({ code: ErrorConstant.PROD });
  }

  // When not in production we allow the message to pass through
  // **This block will be removed in production builds**
  throw RemirrorError.of(options);
}

/**
 * The invariant options which only show up during development.
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
