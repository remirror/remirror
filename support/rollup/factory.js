import babel from 'rollup-plugin-babel';
import builtins from 'rollup-plugin-node-builtins';
import globals from 'rollup-plugin-node-globals';
import json from 'rollup-plugin-json';
import resolve from 'rollup-plugin-node-resolve';

/* Inspired by https://github.com/ianstormtaylor/slate/blob/6302b2d9d2d6a62ba32e6a7d987db5db8f846eef/support/rollup/factory.js#L1-L148 */

/**
 * Return a Rollup configuration for a `pkg` with `env` and `target`.
 *
 * @param {Object} pkg
 * @param {String} env
 * @param {String} format
 * @return {Object}
 */

function configure(pkg, env, target, rootFolder = '@remirror') {
  const folderName = pkg.name.replace('@remirror/', '');
  const extensions = ['.mjs', '.json', '.ts', '.tsx', '.js'];

  const isModule = target === 'module';
  const input = `${rootFolder}/${folderName}/src/index.ts`;
  const deps = []
    .concat(pkg.dependencies ? Object.keys(pkg.dependencies) : [])
    .concat(pkg.peerDependencies ? Object.keys(pkg.peerDependencies) : []);

  const plugins = [
    // Allow Rollup to resolve modules from `node_modules`, since it only
    // resolves local modules by default.
    resolve({
      browser: true,
      extensions,
      preferBuiltins: false,
    }),

    // Convert JSON imports to ES6 modules.
    json(),

    // Register Node.js builtins for browserify compatibility.
    builtins(),

    // Use Babel to transpile the result, limiting it to the source code.
    babel({
      include: [`${rootFolder}/${folderName}/src/**`],
      extensions,
      exclude: ['node_modules/**', '*.json'],
      runtimeHelpers: true,
    }),

    // Register Node.js globals for browserify compatibility.
    globals(),
  ].filter(Boolean);

  if (isModule) {
    return {
      plugins,
      input,
      output: [
        {
          file: `${rootFolder}/${folderName}/${pkg.module}`,
          format: 'es',
          sourcemap: true,
        },
        {
          file: `${rootFolder}/${folderName}/${pkg.cjs}`,
          format: 'cjs',
          exports: 'named',
          sourcemap: true,
        },
      ],
      // We need to explicitly state which modules are external, meaning that
      // they are present at runtime. In the case of non-UMD configs, this means
      // all non-Remirror packages.
      external: id => {
        return !!deps.find(dep => dep === id || id.startsWith(`${dep}/`));
      },
    };
  }
}

/**
 * Return a Rollup configuration for a `pkg`.
 *
 * @return {Array}
 */

function factory(pkg, rootFolder) {
  return [configure(pkg, 'development', 'module', rootFolder)].filter(Boolean);
}

/**
 * Export.
 *
 * @type {Function}
 */

export default factory;
