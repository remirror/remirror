/**
 * The error codes for errors used throughout the codebase.
 *
 * @remarks
 *
 * They can be removed but should never be changed since they are also used to
 * reference the errors within search engines.
 */
export enum ErrorConstant {
  /** An error occurred in production. Details shall be hidden. */
  PROD = 'RMR0000',

  /** An error happened but we're not quite sure why. */
  UNKNOWN = 'RMR0001',

  /** The arguments passed to the command method were invalid. */
  INVALID_COMMAND_ARGUMENTS = 'RMR0002',

  /** This is a custom error possibly thrown by an external library. */
  CUSTOM = 'RMR0003',

  /**
   * An error occurred in a function called from the `@remirror/core-helpers`
   * library.
   */
  CORE_HELPERS = 'RMR0004',

  /** You have attempted to change a value that shouldn't be changed. */
  MUTATION = 'RMR0005',

  /**
   * This is an error which should not occur and is internal to the remirror
   * codebase.
   */
  INTERNAL = 'RMR0006',

  /** You're editor is missing a required extension. */
  MISSING_REQUIRED_EXTENSION = 'RMR0007',

  /**
   * Called a method event at the wrong time. Please make sure getter functions
   * are only called with within the scope of the returned functions. They
   * should not be called in the outer scope of your method.
   */
  MANAGER_PHASE_ERROR = 'RMR0008',

  /**
   * The user requested an invalid extension from the preset. Please check the
   * `createExtensions` return method is returning an extension with the defined
   * constructor.
   */
  INVALID_PRESET_EXTENSION = 'RMR0010',

  /**
   * Invalid value passed into `Manager constructor`. Only `Presets` and
   * `Extensions` are supported.
   */
  INVALID_MANAGER_ARGUMENTS = 'RMR0011',

  /**
   * The commands method which is passed into the `createCommands` function
   * should only be called within the created command function otherwise it will
   * not have access to the other commands.
   */
  COMMANDS_CALLED_IN_OUTER_SCOPE = 'RMR0012',

  /** The user requested an invalid extension from the manager. */
  INVALID_MANAGER_EXTENSION = 'RMR0013',

  /** The user requested an invalid preset from the manager. */
  INVALID_MANAGER_PRESET = 'RMR0014',

  /** Command method names must be unique within the editor. */
  DUPLICATE_COMMAND_NAMES = 'RMR0015',

  /** Helper method names must be unique within the editor. */
  DUPLICATE_HELPER_NAMES = 'RMR0016',
}
