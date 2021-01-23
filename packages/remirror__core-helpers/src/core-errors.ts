import { BaseError } from 'make-error';
import { ErrorConstant } from '@remirror/core-constants';

import { includes, isString, values } from './core-helpers';

/**
 * Errors have their own URL which will be logged to the console for simpler
 * debugging.
 */
const ERROR_INFORMATION_URL = 'https://remirror.io/docs/errors';

let errorMessageMap: Partial<Record<ErrorConstant, string>> = {};

// This will be removed in a production environment.
if (process.env.NODE_ENV !== 'production') {
  errorMessageMap = {
    [ErrorConstant.PROD]:
      'An error occurred with the `Remirror` setup in production. Any details are purposefully being withheld.',
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
      'This occurs when accessing a method or property before it is available.',
    [ErrorConstant.INVALID_GET_EXTENSION]:
      'The user requested an invalid extension from the getExtensions method. Please check the `createExtensions` return method is returning an extension with the defined constructor.',
    [ErrorConstant.INVALID_MANAGER_ARGUMENTS]:
      'Invalid value(s) passed into `Manager` constructor. Only `Presets` and `Extensions` are supported.',
    [ErrorConstant.SCHEMA]:
      "There is a problem with the schema or you are trying to access a node / mark that doesn't exists.",
    [ErrorConstant.HELPERS_CALLED_IN_OUTER_SCOPE]:
      'The `helpers` method which is passed into the ``create*` method should only be called within returned method since it relies on an active view (not present in the outer scope).',
    [ErrorConstant.INVALID_MANAGER_EXTENSION]:
      'You requested an invalid extension from the manager.',
    [ErrorConstant.DUPLICATE_COMMAND_NAMES]:
      'Command method names must be unique within the editor.',
    [ErrorConstant.DUPLICATE_HELPER_NAMES]: 'Helper method names must be unique within the editor.',
    [ErrorConstant.NON_CHAINABLE_COMMAND]: 'Attempted to chain a non chainable command.',
    [ErrorConstant.INVALID_EXTENSION]: 'The provided extension is invalid.',
    [ErrorConstant.INVALID_CONTENT]: 'The content provided to the editor is not supported.',
    [ErrorConstant.INVALID_NAME]: 'An invalid name was used for the extension.',
    [ErrorConstant.EXTENSION]:
      'An error occurred within an extension. More details should be made available.',
    [ErrorConstant.EXTENSION_SPEC]:
      'The spec was defined without calling the `defaults`, `parse` or `dom` methods.',
    [ErrorConstant.EXTENSION_EXTRA_ATTRIBUTES]:
      'Extra attributes must either be a string or an object.',
    [ErrorConstant.INVALID_SET_EXTENSION_OPTIONS]:
      'A call to `extension.setOptions` was made with invalid keys.',
    [ErrorConstant.REACT_PROVIDER_CONTEXT]:
      '`useRemirror` was called outside of the `remirror` context. It can only be used within an active remirror context created by the `<Remirror />`.',
    [ErrorConstant.REACT_GET_ROOT_PROPS]:
      '`getRootProps` has been attached to the DOM more than once. It should only be attached to the dom once per editor.',
    [ErrorConstant.REACT_EDITOR_VIEW]: 'A problem occurred adding the editor view to the dom.',
    [ErrorConstant.REACT_CONTROLLED]: 'There is a problem with your controlled editor setup.',
    [ErrorConstant.REACT_NODE_VIEW]:
      'Something went wrong with your custom ReactNodeView Component.',
    [ErrorConstant.REACT_GET_CONTEXT]:
      'You attempted to call `getContext` provided by the `useRemirror` prop during the first render of the editor. This is not possible and should only be after the editor first mounts.',
    [ErrorConstant.REACT_COMPONENTS]: 'An error occurred within a remirror component.',
    [ErrorConstant.REACT_HOOKS]: 'An error occurred within a remirror hook.',

    [ErrorConstant.I18N_CONTEXT]: 'You called `useI18n()` outside of an `I18nProvider` context.',
  };
}

/**
 * Checks whether the passed code is an `ErrorConstant`.
 */
function isErrorConstant(code: unknown): code is ErrorConstant {
  return isString(code) && includes(values(ErrorConstant), code);
}

/**
 * Create an error message from the provided error code.
 */
function createErrorMessage(code: ErrorConstant, extraMessage?: string) {
  const message = errorMessageMap[code];
  const prefix = message ? `${message}\n\n` : '';
  const customMessage = extraMessage ? `${extraMessage}\n\n` : '';

  return `${prefix}${customMessage}For more information visit ${ERROR_INFORMATION_URL}#${code.toLowerCase()}`;
}

/**
 * This marks the error as a remirror specific error, with enhanced stack
 * tracing capabilities.
 *
 * @remarks
 *
 * Use this when creating your own extensions and notifying the user that
 * something has gone wrong.
 */
export class RemirrorError extends BaseError {
  /**
   * A shorthand way of creating an error message.
   */
  static create(options: RemirrorErrorOptions = {}): RemirrorError {
    return new RemirrorError(options);
  }

  /**
   * The error code used to create this error message.
   */
  errorCode: ErrorConstant;

  /**
   * The link to read more about the error online.
   */
  url: string;

  /**
   * The constructor is intentionally kept private to prevent being extended from.
   */
  private constructor({ code, message, disableLogging = false }: RemirrorErrorOptions = {}) {
    let errorCode: ErrorConstant;

    if (isErrorConstant(code)) {
      errorCode = code;
      super(createErrorMessage(errorCode, message));
    } else {
      errorCode = ErrorConstant.CUSTOM;
      super(createErrorMessage(errorCode, message));
    }

    this.errorCode = errorCode;
    this.url = `${ERROR_INFORMATION_URL}#${errorCode.toLowerCase()}`;

    if (!disableLogging) {
      // Log the error.
      // eslint-disable-next-line no-console
      console.error(this.message);
    }
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
  if (process.env.NODE_ENV === 'production') {
    throw RemirrorError.create({ code: ErrorConstant.PROD });
  }

  // When not in production we allow the message to pass through
  // **This is never called in production builds.**
  throw RemirrorError.create(options);
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

  /**
   * When true logging to the console is disabled.
   *
   * @default false
   */
  disableLogging?: boolean;
}
