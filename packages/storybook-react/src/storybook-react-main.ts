import glob from 'globby';
import isCI from 'is-ci';
import { baseDir } from 'scripts';
import type { Configuration } from 'webpack';
import { isArray, isPlainObject } from '@remirror/core';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const babelConfig = require(baseDir('packages', 'storybook-react', '.babelrc.js'));

export const stories = glob.sync(baseDir('packages/*/__stories__/*.stories.(tsx)'), {
  ignore: ['**/node_modules'],
});

// Make the introduction the first story.
stories.sort((a, b) => {
  if (a.includes('introduction.stories.tsx')) {
    return -1;
  } else if (b.includes('introduction.stories.tsx')) {
    return 1;
  }

  return 0;
});

// export const addons = ['@storybook/addon-postcss'];

const mode = isCI ? 'production' : 'development';
// const dev = process.env.NODE_ENV !== 'production';

export async function webpackFinal(config: Configuration): Promise<Configuration> {
  config.mode = mode;
  // config?.plugins?.push(new DefinePlugin({ 'process.env': { NODE_ENV: JSON.stringify(mode) } }));

  config.module?.rules?.push({
    test: /\.tsx?$/,
    use: [{ loader: require.resolve('babel-loader'), options: babelConfig }],
    exclude: [/node_modules/],
  });

  // config.module?.rules?.push({
  //   test: /-theme\.tsx?$/,
  //   exclude: [/node_modules/],
  //   use: [
  //     { loader: require.resolve('babel-loader'), options: babelConfig },
  //     {
  //       loader: require.resolve('@linaria/webpack-loader'),
  //       options: { sourceMap: dev, preprocessor: 'none' },
  //     },
  //   ],
  // });

  const externals = config.externals ?? {};
  const plugins = config.plugins ?? [];
  const resolve = config.resolve ?? {};

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

  return config;
}

export const typescript = {
  check: false,
  reactDocgen: false,
};
