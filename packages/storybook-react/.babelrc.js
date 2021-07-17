const config = require('../../support/base.babel');

const plugins = [...config.plugins];
const presets = [...config.presets, require.resolve('@linaria/babel-preset')];

module.exports = { ...config, presets, plugins, sourceType: 'unambiguous' };
