/**
 * The error codes for errors used throughout the codebase.
 *
 * @remarks
 *
 * They can be removed but should never be changed since they are also used to
 * reference the errors within search engines.
 */
export enum ErrorConstant {
  /**
   * An error occurred in production. Details shall be hidden.
   */
  PROD = 'RMR0000',

  /**
   * An error happened but we're not quite sure why.
   */
  UNKNOWN = 'RMR0001',

  /**
   * You can only pass `extraAttributes` to a node extension or a mark extension.
   */
  EXTRA_ATTRS = 'RMR0002',

  /**
   * This is a custom error possibly thrown by an external library.
   */
  CUSTOM = 'RMR0003',
}
