/* eslint-disable import/no-extraneous-dependencies */

import replace from 'rollup-plugin-replace';
import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import { terser } from 'rollup-plugin-terser';
import { camelCase } from 'lodash';

const pkg = require('./package.json');

/* Plugins used throughout */

const extensions = ['.mjs', '.json', '.ts', '.tsx', '.js'];

const plugins = {
  babel: babel({
    exclude: '**/node_modules/**',
    extensions,
  }),
  resolve: resolve({
    extensions,
    jsnext: true,
    main: true,
  }),
  browser: resolve({
    extensions,
    browser: true,
  }),
  cjs: commonjs(),
  replace: replace({
    'process.env.NODE_ENV': JSON.stringify('production'),
  }),
  uglify: terser(),
};

/* BaseConfig to extend */

const baseConfig = {
  watch: {
    include: 'src/**',
  },
  input: `src/index.ts`,
};

/* Gather the external libraries */

const external = [...Object.keys(pkg.peerDependencies), ...Object.keys(pkg.dependencies)];

/* ES Config for modern toolchains */

const esConfig = {
  ...baseConfig,
  output: {
    file: pkg.module,
    format: 'es',
    sourcemap: true,
  },
  external,
  plugins: [plugins.babel, plugins.resolve, plugins.cjs],
};

// So that the DEV build doesn't break while working on the project
const umdDefaultGlobals = external.reduce((prev, curr) => {
  return { ...prev, [curr]: camelCase(curr) };
}, {});

/* Global variables. Untested. TODO test this */

const globals = {
  ...umdDefaultGlobals,
  ...{
    react: 'React',
    'react-dom': 'ReactDOM',
  },
};

/* UMD Config */

const umdConfig = {
  ...baseConfig,
  output: {
    name: 'Remirror',
    file: pkg.browser,
    format: 'umd',
    globals,
    exports: 'named',
    sourcemap: false,
  },
  external: Object.keys(globals),
  plugins: [plugins.babel, plugins.browser, plugins.cjs],
};

/* Minified Build Config */

const minConfig = {
  ...umdConfig,
  output: {
    ...umdConfig.output,
    file: pkg.browser.replace('.js', '.min.js'),
  },
  plugins: [...umdConfig.plugins, plugins.replace, plugins.uglify],
};

const configs = [esConfig, umdConfig];

/* Don't build minified while in development */

if (!process.argv.includes('-w')) configs.push(minConfig);

export default configs;
