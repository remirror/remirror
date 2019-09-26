import babel from 'rollup-plugin-babel';
import builtins from 'rollup-plugin-node-builtins';
import globals from 'rollup-plugin-node-globals';
import json from 'rollup-plugin-json';
import resolve from 'rollup-plugin-node-resolve';
import autoExternal from 'rollup-plugin-auto-external';
import { join } from 'path';
import chalk from 'chalk';

/* Inspired by https://github.com/ianstormtaylor/slate/blob/6302b2d9d2d6a62ba32e6a7d987db5db8f846eef/support/rollup/factory.js#L1-L148 */

/**
 * Return a Rollup configuration for a `pkg`
 *
 * @param {Object} packageJson
 * @return {Object}
 */

const configure = (packageJson, path) => {
  const extensions = ['.mjs', '.json', '.ts', '.tsx', '.js'];
  const packagePath = join(path, 'package.json');

  const input = join(path, 'src', 'index.ts');
  const deps = []
    .concat(packageJson.dependencies ? Object.keys(packageJson.dependencies) : [])
    .concat(
      packageJson.peerDependencies ? Object.keys(packageJson.peerDependencies) : [],
    );

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
      include: [join(path, 'src', '**')],
      extensions,
      exclude: ['node_modules/**', '*.json'],
      runtimeHelpers: true,
    }),

    autoExternal({
      dependencies: true,
      packagePath,
      peerDependencies: true,
    }),

    // Register Node.js globals for browserify compatibility.
    globals(),
  ];

  const bundledOutput = {
    plugins,
    input,
    output: [
      packageJson.module && {
        file: join(path, packageJson.module),
        format: 'es',
        sourcemap: true,
      },
      packageJson.cjs && {
        file: join(path, packageJson.cjs),
        format: 'cjs',
        exports: 'named',
        sourcemap: true,
      },
    ].filter(Boolean),
    // We need to explicitly state which modules are external, meaning that
    // they are present at runtime.
    external: id => {
      const isExternal = !!deps.find(dep => dep === id || id.startsWith(`${dep}/`));
      if (id === '@emotion/core' && !isExternal) {
        throw new Error(
          chalk`{red.bold Invalid configuration for '${packageJson.name}'}: {yellow '@emotion/core' must be declared as a {bold dependency} or {bold peerDependency}.}`,
        );
      }

      return isExternal;
    },
  };

  const moduleOutput = {
    ...bundledOutput,
    output: {
      dir: join(path, 'lib'),
      format: 'cjs',
      exports: 'named',
      sourcemap: true,
    },
    preserveModules: true,
  };

  return [(packageJson.module || packageJson.cjs) && bundledOutput, moduleOutput].filter(
    Boolean,
  );
};

/**
 * Return a Rollup configuration for a `pkg`.
 *
 * @return {Array}
 */

const factory = (pkg, root) => {
  return configure(pkg, root);
};

/**
 * Export.
 *
 * @type {Function}
 */

export default factory;
