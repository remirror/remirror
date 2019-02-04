const defaultConfig = require('../../support/babel/base.babel');

module.exports = {
  ...defaultConfig,
  plugins: [
    '@babel/plugin-proposal-class-properties',
    '@babel/plugin-proposal-object-rest-spread',
    '@babel/plugin-syntax-dynamic-import',
    'lodash',
  ],
};
