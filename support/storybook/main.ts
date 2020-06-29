module.exports = {
  stories: ['./stories/*.stories.tsx'],
  addons: ['@storybook/addon-actions', '@storybook/addon-links'],
  webpackFinal: async (config: any) => {
    config.module.rules.push({
      test: /\.tsx?$/,
      loader: require.resolve('babel-loader'),
      options: require('./.babelrc.js'),
    });
    config.resolve.extensions.push('.ts', '.tsx');

    return config;
  },
};
