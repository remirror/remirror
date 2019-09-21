import babel from 'rollup-plugin-babel';
import builtins from 'rollup-plugin-node-builtins';
import globals from 'rollup-plugin-node-globals';
import json from 'rollup-plugin-json';
import resolve from 'rollup-plugin-node-resolve';
import autoExternal from 'rollup-plugin-auto-external';
import path from 'path';

/* Inspired by https://github.com/ianstormtaylor/slate/blob/6302b2d9d2d6a62ba32e6a7d987db5db8f846eef/support/rollup/factory.js#L1-L148 */

/**
 * Return a Rollup configuration for a `pkg`
 *
 * @param {Object} pkg
 * @return {Object}
 */

function configure(pkg, rootFolder = '@remirror') {
  const folderName = pkg.name.replace('@remirror/', '');
  const extensions = ['.mjs', '.json', '.ts', '.tsx', '.js'];

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

    autoExternal({
      dependencies: true,
      packagePath: path.resolve(
        __dirname,
        '../../',
        rootFolder,
        folderName,
        'package.json',
      ),
      peerDependencies: true,
    }),

    // Register Node.js globals for browserify compatibility.
    globals(),
  ];

  const bundledOutput = {
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

  const moduleOutput = {
    ...bundledOutput,
    output: {
      dir: `${rootFolder}/${folderName}/lib`,
      format: 'cjs',
      exports: 'named',
      sourcemap: true,
    },
    preserveModules: true,
  };

  return [bundledOutput, moduleOutput];
}

/**
 * Return a Rollup configuration for a `pkg`.
 *
 * @return {Array}
 */

function factory(pkg, rootFolder) {
  return configure(pkg, rootFolder);
}

/**
 * Export.
 *
 * @type {Function}
 */

export default factory;
