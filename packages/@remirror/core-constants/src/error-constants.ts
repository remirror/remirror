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
   * The user requested an invalid extension from the getExtensions method.
   * Please check the `createExtensions` return method is returning an extension
   * with the defined constructor.
   */
  INVALID_GET_EXTENSION = 'RMR0010',

  /**
   * Invalid value passed into `Manager constructor`. Only and
   * `Extensions` are supported.
   */
  INVALID_MANAGER_ARGUMENTS = 'RMR0011',

  /**
   * There is a problem with the schema or you are trying to access a node /
   * mark that doesn't exists.
   */
  SCHEMA = 'RMR0012',

  /**
   * The `helpers` method which is passed into the ``create*` method should only
   * be called within returned method since it relies on an active view (not
   * present in the outer scope).
   */
  HELPERS_CALLED_IN_OUTER_SCOPE = 'RMR0013',

  /** The user requested an invalid extension from the manager. */
  INVALID_MANAGER_EXTENSION = 'RMR0014',

  /** Command method names must be unique within the editor. */
  DUPLICATE_COMMAND_NAMES = 'RMR0016',

  /** Helper method names must be unique within the editor. */
  DUPLICATE_HELPER_NAMES = 'RMR0017',

  /** Attempted to chain a non chainable command. */
  NON_CHAINABLE_COMMAND = 'RMR0018',

  /** The provided extension is invalid. */
  INVALID_EXTENSION = 'RMR0019',

  /** The content provided to the editor is not supported. */
  INVALID_CONTENT = 'RMR0021',

  /** An invalid name was used for the extension. */
  INVALID_NAME = 'RMR0050',

  /** An error occurred within an extension. */
  EXTENSION = 'RMR0100',

  /** The spec was defined without calling the `defaults`, `parse` or `dom` methods. */
  EXTENSION_SPEC = 'RMR0101',

  /** Extra attributes must either be a string or an object. */
  EXTENSION_EXTRA_ATTRIBUTES = 'RMR0102',

  /** A call to `extension.setOptions` was made with invalid keys. */
  INVALID_SET_EXTENSION_OPTIONS = 'RMR0103',

  /**
   * `useRemirror` was called outside of the remirror context. It can only be used
   * within an active remirror context created by the `<Remirror />`.
   */
  REACT_PROVIDER_CONTEXT = 'RMR0200',

  /**
   * `getRootProps` has been called MULTIPLE times. It should only be called ONCE during render.
   */
  REACT_GET_ROOT_PROPS = 'RMR0201',

  /**
   * A problem occurred adding the editor view to the dom.
   */
  REACT_EDITOR_VIEW = 'RMR0202',

  /**
   * There is a problem with your controlled editor setup.
   */
  REACT_CONTROLLED = 'RMR0203',

  /**
   * Something went wrong with your custom ReactNodeView Component.
   */
  REACT_NODE_VIEW = 'RMR0204',

  /**
   * You attempted to call `getContext` provided by the `useRemirror` prop
   * during the first render of the editor. This is not possible and should only
   * be after the editor first mounts.
   */
  REACT_GET_CONTEXT = 'RMR0205',

  /**
   * An error occurred when rendering the react components.
   */
  REACT_COMPONENTS = 'RMR0206',

  /**
   * An error occurred within a remirror hook.
   */
  REACT_HOOKS = 'RMR0207',

  /**
   * There is something wrong with your i18n setup.
   */
  I18N_CONTEXT = 'RMR0300',
}
