const config = require('../../support/base.babel');

module.exports = {
  ...config,
  presets: ['module:metro-react-native-babel-preset', ...config.presets, '@linaria'],
};
