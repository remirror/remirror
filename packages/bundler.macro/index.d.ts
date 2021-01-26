/**
 * Bundle the provided path with rollup.
 */
export function bundle(path: string, name: string): string;

/**
 * Transpile a single file import. Exports and imports are not recognized.
 */
export function transpile(path: string): string;
