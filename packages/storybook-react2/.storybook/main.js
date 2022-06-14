module.exports = {
  stories: [
    '../stories/**/introduction.stories.@(js|jsx|ts|tsx)',
    '../stories/**/bold.stories.@(js|jsx|ts|tsx)',
    '../stories/**/italic.stories.@(js|jsx|ts|tsx)',
  ],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    {
      name: '@storybook/addon-postcss',
      options: {
        postcssLoaderOptions: {
          implementation: require('postcss'),
        },
      },
    },
  ],
  core: {
    builder: 'webpack5',
    options: {
      lazyCompilation: true,
    },
  },
  features: {
    storyStoreV7: true,
  },

  webpackFinal: async (config, { configType }) => {
    // `configType` has a value of 'DEVELOPMENT' or 'PRODUCTION'
    // You can change the configuration based on that.
    // 'PRODUCTION' is used when building the static version of storybook.

    // Disable fullySpecified
    config.resolve.fullySpecified = false;
    console.log('config:', config);

    // // Make whatever fine-grained changes you need
    // config.module.rules.push({
    //   test: /\.scss$/,
    //   use: ['style-loader', 'css-loader', 'sass-loader'],
    //   include: path.resolve(__dirname, '../'),
    // });

    // Return the altered config
    return config;
  },
};
