import type { Configuration } from 'webpack';
import { isArray, isPlainObject } from '@remirror/core-helpers';

export default {
  stories: ['./src/*.stories.tsx'],
  addons: ['@storybook/addon-actions', '@storybook/addon-links'],
  webpackFinal: async (config: Configuration): Promise<Configuration> => {
    config.module?.rules.push({
      test: /\.tsx?$/,
      use: [{ loader: require.resolve('babel-loader'), options: require('./.babelrc.js') }],
      exclude: [/node_modules/],
    });

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
  },
};
