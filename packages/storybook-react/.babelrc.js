const config = require('../../support/base.babel');

const plugins = [...config.plugins];

module.exports = { ...config, plugins, sourceType: 'unambiguous' };
