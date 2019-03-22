import babel from 'rollup-plugin-babel';
import builtins from 'rollup-plugin-node-builtins';
import commonjs from 'rollup-plugin-commonjs';
import globals from 'rollup-plugin-node-globals';
import json from 'rollup-plugin-json';
import replace from 'rollup-plugin-replace';
import resolve from 'rollup-plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';
import { startCase } from 'lodash';

/* Copied from https://github.com/ianstormtaylor/slate/blob/6302b2d9d2d6a62ba32e6a7d987db5db8f846eef/support/rollup/factory.js#L1-L148 */

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

  const isProd = env === 'production';
  const isUmd = target === 'umd';
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

    // Allow Rollup to resolve CommonJS modules, since it only resolves ES2015
    // modules by default.
    isUmd &&
      commonjs({
        exclude: [
          `${rootFolder}/${folderName}/src/**`,
          `${rootFolder}/${folderName}/lib/**`,
        ],
        // HACK: Sometimes the CommonJS plugin can't identify named exports, so
        // we have to manually specify named exports here for them to work.
        // https://github.com/rollup/rollup-plugin-commonjs#custom-named-exports
        namedExports: {
          '@remirror/core': ['Doc', 'Text'],
          '@remirror/renderer-react': ['ReactSerializer'],
          'react-dom': [
            'findDOMNode',
            'unstable_renderSubtreeIntoContainer',
            'unmountComponentAtNode',
          ],
          'react-dom/server': ['renderToStaticMarkup'],
        },
        extensions,
      }),

    // Replace `process.env.NODE_ENV` with its value, which enables some modules
    // like React and Remirror to use their production variant.
    replace({
      'process.env.NODE_ENV': JSON.stringify(env),
    }),

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

    // Only minify the output in production, since it is very slow. And only
    // for UMD builds, since modules will be bundled by the consumer.
    isUmd && isProd && terser(),
  ].filter(Boolean);

  if (isUmd) {
    return {
      plugins,
      input,
      output: {
        format: 'umd',
        file: `${rootFolder}/${folderName}/${!isProd ? pkg.umd : pkg['umd:min']}`,
        exports: 'named',
        name: startCase(pkg.name).replace(/ /g, ''),
        globals: pkg.umdGlobals,
      },
      external: Object.keys(pkg.umdGlobals || {}),
    };
  }

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
        // {
        //   file: `${rootFolder}/${folderName}/lib/dist/${folderName}.js`,
        //   format: 'cjs',
        //   exports: 'named',
        //   sourcemap: true,
        // },
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
  return [
    configure(pkg, 'development', 'module', rootFolder),
    configure(pkg, 'development', 'umd', rootFolder),
    configure(pkg, 'production', 'umd', rootFolder),
  ].filter(Boolean);
}

/**
 * Export.
 *
 * @type {Function}
 */

export default factory;
