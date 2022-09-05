// See also https://jestjs.io/docs/28.x/configuration#resolver-string

module.exports = (path, options) => {
  // Call the defaultResolver, so we leverage its cache, error handling, etc.
  return options.defaultResolver(path, {
    ...options,
    // Use packageFilter to process parsed `package.json` before the resolution (see https://www.npmjs.com/package/resolve#resolveid-opts-cb)
    packageFilter: (pkg) => {
      /**
       * Remirror packages are dual-formats packages with the following content
       * in their package.json:
       *
       * { "main": "xx.cjs", "module": "xx.js", "type": "module" }
       *
       * It seems that when `"main": "xx.cjs"` exists, Jest will treat this
       * package as a CommonJS package. (source:
       * https://github.com/facebook/jest/issues/9771#issuecomment-946052045)
       *
       * That's NOT what we want, because we cannot use named import for a
       * CommonJS package. In particular, the following code will fail:
       *
       * ```ts
       * // packages/remirror__extension-columns/__tests__/columns-extension.spec.ts
       * import { ColumnsExtension } from '../';
       * ```
       *
       * ```bash
       * $ pnpm test
       * SyntaxError: The requested module '../' does not provide an export
       * named 'ColumnsExtension'
       * ```
       *
       * To fix this, we need to make sure that Jest cannot find `.cjs` in the
       * package.json. So we are using the value in the `module` field to
       * override `main` field.
       */
      if (pkg.module && pkg.type === 'module') {
        return {
          ...pkg,
          main: pkg.module,
        };
      }

      return pkg;
    },
  });
};
