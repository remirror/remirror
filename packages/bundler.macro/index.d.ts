/**
 * Bundle the provided path with rollup.
 *
 * @param path - the relative path to the entry point which will be transformed.
 * @param name - the global name which is given to the default export
 */
export function rollupBundle(path: string, name: string): string;

/**
 * Transpile a single file import. Exports and imports are not recognized.
 */
export function transpileFile(path: string): string;
