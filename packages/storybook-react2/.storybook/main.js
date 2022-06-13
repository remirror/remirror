module.exports = {
  stories: [
    '../stories/**/introduction.stories.@(js|jsx|ts|tsx)',
    '../stories/**/bold.stories.@(js|jsx|ts|tsx)',
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
  },
  features: {
    storyStoreV7: true,
  },
};
