export function ensureCjsFilename(filePath: string) {
  if (!/\.[cm]?js$/.test(filePath)) {
    throw new Error(`filePath should be a .js, .cjs, or .mjs file: ${filePath}`);
  }

  return filePath.replace(/\.[cm]?js$/, '.cjs');
}
