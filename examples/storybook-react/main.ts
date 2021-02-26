import type { Configuration } from 'webpack';

export default {
  stories: ['./src/*.stories.tsx'],
  addons: ['@storybook/addon-actions', '@storybook/addon-links'],
  webpackFinal: async (config: Configuration): Promise<Configuration> => {
    config.module?.rules.push({
      test: /\.tsx?$/,
      use: [{ loader: require.resolve('babel-loader'), options: require('./.babelrc.js') }],
      exclude: [/node_modules/],
    });

    const plugins = config.plugins ?? [];
    const resolve = config.resolve ?? {};
    resolve.extensions = resolve.extensions ?? [];

    resolve.extensions.push('.ts', '.tsx');
    const alias = resolve.alias ?? {};
    config.resolve = resolve;
    config.plugins = plugins;

    // Use emotion as an alias for linaria.
    alias['@linaria/core'] = '@emotion/css';

    return config;
  },
};
