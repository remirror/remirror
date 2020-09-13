import { Configuration } from 'webpack';

export default {
  stories: ['./stories/*.stories.tsx'],
  addons: ['@storybook/addon-actions', '@storybook/addon-links'],
  webpackFinal: async (config: Configuration): Promise<Configuration> => {
    config.module?.rules.push({
      test: /\.tsx?$/,
      loader: require.resolve('babel-loader'),
      options: require('./.babelrc.js'),
    });

    config.resolve?.extensions?.push('.ts', '.tsx');

    return config;
  },
};
