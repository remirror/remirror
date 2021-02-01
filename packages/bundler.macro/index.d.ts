/**
 * Bundle the provided path with rollup.
 *
 * The Bundle is given a name of `__ROLLUP_BUNDLER_MACRO__`
 *
 * @param path - the relative path to the entry point which will be transformed.
 * @param cacheBuster - babel macros are cached by default. This remove the cache.
 */
export function rollupBundle(path: string, cacheBuster?: string): string;

/**
 * Transpile a single file import. Exports and imports are not recognized.
 */
export function transpileFile(path: string, cacheBuster?: string): string;
