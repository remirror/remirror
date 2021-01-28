const config = require('../../support/base.babel');

module.exports = {
  ...config,
  presets: [...config.presets, 'module:metro-react-native-babel-preset', '@linaria'],
};
