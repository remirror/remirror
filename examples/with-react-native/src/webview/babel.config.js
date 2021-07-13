const config = require('../../../../support/base.babel');

module.exports = {
  ...config,
  presets: [...config.presets, '@linaria'],
};
