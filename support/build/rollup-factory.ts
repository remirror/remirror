// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="./patches.d.ts" />

import json from '@rollup/plugin-json';
import resolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import chalk from 'chalk';
import { join } from 'path';
import { OutputOptions, Plugin, RollupOptions } from 'rollup';
import autoExternal from 'rollup-plugin-auto-external';
import babel from 'rollup-plugin-babel';
import globals from 'rollup-plugin-node-globals';
import sourcemaps from 'rollup-plugin-sourcemaps';
import { terser } from 'rollup-plugin-terser';

import { keys, PackageJson, writeCjsEntryFile } from './helpers';

// import typescript from 'rollup-plugin-typescript2';

/**
 * Create a rollup configuration for the provided package.json object and path.
 *
 * @param packageJson
 */

const configure = async ({
  pkg,
  root,
  devOnly = false,
}: {
  pkg: PackageJson;
  root: string;
  devOnly?: boolean;
}) => {
  const extensions = ['.mjs', '.json', '.ts', '.tsx', '.js', '.node'];
  const packagePath = join(root, 'package.json');

  // The names of the files for production and development
  const cjsFileName = pkg.cjs ? join(root, pkg.cjs) : '';
  const cjsProdFileName = cjsFileName.replace('.js', '.min.js');
  const moduleFileName = pkg.module ? join(root, pkg.module) : '';
  const moduleProdFileName = moduleFileName.replace('.js', '.min.js');

  const input = join(root, 'src', 'index.ts');
  const deps = [...keys(pkg.dependencies ?? {}), ...keys(pkg.peerDependencies ?? {})];

  // When this is a CommonJS package create a special entry point.
  if (pkg.cjs) {
    await writeCjsEntryFile({
      path: join(root, 'lib', 'dist'),
      production: cjsProdFileName,
      development: cjsFileName,
      devOnly,
    });
  }

  const createPlugins = (env: 'production' | 'development' = 'development') => {
    const plugins: Plugin[] = [
      // Allow Rollup to resolve modules from `node_modules`, since it only
      // resolves local modules by default.
      resolve({
        browser: true,
        extensions,
        preferBuiltins: false,
      }),

      // Convert JSON imports to ES6 modules.
      json(),

      // Use Babel to transpile the result, limiting it to the source code.
      babel({
        include: [join(root, 'src', '**')],
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

      replace({
        'process.env.NODE_ENV': env,
        __VERSION__: pkg.version,
      }),

      // Loading files with existing source maps
      sourcemaps(),
    ];

    if (env === 'production') {
      plugins.push(
        terser({
          sourcemap: true,
          output: { comments: false },
          compress: {
            keep_infinity: true,
            pure_getters: true,
            passes: 10,
          },
          ecma: 5,
          warnings: true,
        }),
      );
    }

    return plugins;
  };

  const defaultOutput: Partial<OutputOptions> = {
    exports: 'named',
    sourcemap: true,
    esModule: true,
  };

  const createBundledOutput = (env: 'production' | 'development'): RollupOptions => {
    const isProd = env === 'production';
    const output: OutputOptions[] = [];

    const configuration: RollupOptions = {
      plugins: createPlugins(env),
      input,
      output,
      // We need to explicitly state which modules are external, meaning that
      // they are present at runtime.
      external: (id) => {
        const isExternal = !!deps.find((dep) => dep === id || id.startsWith(`${dep}/`));
        if (id === '@emotion/core' && !isExternal) {
          throw new Error(
            chalk`{red.bold Invalid configuration for '${pkg.name}'}: {yellow '@emotion/core' must be declared as a {bold dependency} or {bold peerDependency}.}`,
          );
        }

        return isExternal;
      },
    };

    if (pkg.module) {
      output.push({
        ...defaultOutput,
        file: isProd ? moduleProdFileName : moduleFileName,
        format: 'es',
      });
    }

    if (pkg.cjs) {
      output.push({
        ...defaultOutput,
        file: isProd ? cjsProdFileName : cjsFileName,
        format: 'cjs',
      });
    }

    return configuration;
  };

  // Create the configuration that spits out the complete module.
  const moduleOutput: RollupOptions = {
    ...createBundledOutput('development'),
    output: {
      ...defaultOutput,
      dir: join(root, 'lib'),
      format: 'cjs',
    },
    preserveModules: true,
  };

  const configurationArray: RollupOptions[] = [moduleOutput];

  if (pkg.cjs || pkg.module) {
    configurationArray.unshift(createBundledOutput('development'));

    if (!devOnly) {
      configurationArray.unshift(createBundledOutput('production'));
    }
  }

  return configurationArray;
};

/**
 * Return a Rollup configuration for a `pkg`.
 */

const factory = async ({
  pkg,
  root,
  devOnly,
}: {
  pkg: PackageJson;
  root: string;
  devOnly?: boolean;
}) => {
  return configure({ pkg, root, devOnly });
};

/**
 * Export.
 *
 * @type {Function}
 */

export default factory;
