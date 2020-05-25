/**
 * A value that can be used in this package to prevent a method being called by
 * external users. If not present it can throw a runtime error.
 *
 * @remarks
 *
 * For example, this is the internal value which is used to check that the
 * editor manager was not created using the `new EditorManager` operator. It
 * must be provided to the constructor and if it isn't there it will cause the
 * manager to throw an error.
 */
export const privacySymbol: unique symbol = Symbol('privacy');
