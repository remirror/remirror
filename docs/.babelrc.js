const defaultConfig = require('../support/babel/base.babel');

module.exports = {
  ...defaultConfig,
  presets: [...defaultConfig.presets, '@emotion/babel-preset-css-prop'],
};
