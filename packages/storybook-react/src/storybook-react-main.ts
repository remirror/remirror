import glob from 'globby';
import isCI from 'is-ci';
import { baseDir } from 'scripts';
import type { Configuration } from 'webpack';
import { isArray, isPlainObject } from '@remirror/core';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const babelConfig = require(baseDir('packages', 'storybook-react', '.babelrc.js'));

const stories = glob.sync(baseDir('packages/*/__stories__/*.stories.(tsx)'), {
  ignore: ['**/node_modules'],
});

const mode = isCI ? 'production' : 'development';

async function webpackFinal(config: Configuration): Promise<Configuration> {
  config.mode = mode;
  // config?.plugins?.push(new DefinePlugin({ 'process.env': { NODE_ENV: JSON.stringify(mode) } }));

  config.module?.rules?.push({
    test: /\.tsx?$/,
    use: [{ loader: require.resolve('babel-loader'), options: babelConfig }],
    exclude: [/node_modules/],
  });

  const externals = config.externals ?? {};
  const plugins = config.plugins ?? [];
  const resolve = config.resolve ?? {};
  const alias = resolve.alias ?? {};

  // Set the ssr helpers for jsdom and domino as externals to the storybook
  // build.
  if (isArray(externals)) {
    externals.push({ jsdom: 'commonjs jsdom', domino: 'commonjs domino' });
  } else if (isPlainObject(externals)) {
    externals.jsdom = 'jsdom';
    externals.domino = 'domino';
  }

  resolve.extensions = resolve.extensions ?? [];
  resolve.extensions.push('.ts', '.tsx');
  config.resolve = resolve;
  config.plugins = plugins;
  config.externals = externals;

  if (process.env.NODE_ENV !== 'production') {
    // Use emotion as an alias for linaria.
    alias['@linaria/core'] = '@emotion/css';
  }

  return config;
}

export const main = {
  stories,
  webpackFinal,
};
