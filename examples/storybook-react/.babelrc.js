const config = require('../../support/base.babel');

module.exports = {
  ...config,
  presets: [...config.presets, require.resolve('@linaria/babel-preset')],
  sourceType: 'unambiguous',
};
