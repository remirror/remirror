module.exports = {
  stories: ['../stories/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: ['@storybook/addon-links', '@storybook/addon-essentials'],
  core: {
    builder: 'webpack5',
    options: {
      lazyCompilation: true,
    },
  },
  features: {
    storyStoreV7: true,
  },
};
