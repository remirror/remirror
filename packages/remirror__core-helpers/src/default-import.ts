// Copy from https://github.com/JacobLey/jacobley/blob/ed11c6e096c9995764fe3351b72a6c9e149cdf00/tools/default-import/src/default-import.ts
// License: MIT

/**
 * Fixes the default import for a CommonJS module.
 *
 * @internal
 *
 * @remark
 *
 * With ESM it is possible to export both a default value and multiple named exports.
 * With CJS it is possible to "mock" ESM functionality with a `__esModule=true` flag
 * but still only export a single "default" export, or multiple named exports.
 *
 * This helper method detects when a library tries to do a "default" export with other named values
 * and returns the "intended" default value.
 *
 * It also handles CJS exports that export an entire object via `module.exports = {}` rather than export syntax,
 * as well as extracting the `default` (if exists) from a dynamic import.
 *
 * Note there is not "namedExport" equivalent because it is assumed module loaders successfully parse that
 * out for both CJS and ESM.
 *
 * @param {*} mod - "default" export that might be wrapped in another layer
 * @returns {*} unwrapped module
 */
export function defaultImport<T>(mod: T): T {
  if (typeof mod !== 'object' || mod === null) {
    return mod;
  }

  // Webpack provides a Module tag to match NodeJS' Module module
  const defaultVal =
    Symbol.toStringTag in mod &&
    (mod as unknown as { [Symbol.toStringTag]: string; default: T })[Symbol.toStringTag] ===
      'Module'
      ? (mod as unknown as { [Symbol.toStringTag]: 'Module'; default?: T }).default ?? mod
      : mod;

  if (
    defaultVal &&
    typeof mod === 'object' &&
    '__esModule' in (defaultVal as any) &&
    (defaultVal as any).__esModule &&
    (defaultVal as any).default !== undefined
  ) {
    return (defaultVal as any).default;
  }

  return defaultVal;
}
