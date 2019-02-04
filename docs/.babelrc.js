const defaultConfig = require('../support/babel/base.babel');

module.exports = {
  ...defaultConfig,
  presets: [...defaultConfig.presets, '@emotion/babel-preset-css-prop'],
  plugins: [
    '@babel/plugin-proposal-class-properties',
    '@babel/plugin-proposal-object-rest-spread',
    '@babel/plugin-syntax-dynamic-import',
    'lodash',
  ],
};
