/**
 * Helps to ignoreUnused variables in tests.
 *
 * @remarks
 *
 * Rather than creating a new tsconfig.json file for all the tests to allow for
 * unused variables, just call this function with the unused variables or
 * parameters.
 */
export const ignoreUnused = (..._: unknown[]): void => {};
