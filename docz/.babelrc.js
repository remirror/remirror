const defaultConfig = require('../config/base.babel');

module.exports = {
  ...defaultConfig,
  presets: [...defaultConfig.presets, '@emotion/babel-preset-css-prop'],
};
