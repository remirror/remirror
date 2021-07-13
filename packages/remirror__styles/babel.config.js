const config = require('../../../support/base.babel');

module.exports = {
  ...config,
  presets: config.presets.filter(
    (preset) => typeof preset === 'string' && !preset.includes('@linaria'),
  ),
};
