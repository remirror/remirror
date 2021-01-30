const config = require('../../support/base.babel');

module.exports = {
  ...config,
  // Remove the babel plugin macro from this so that this can be properly tested.
  plugins: [config.plugins.filter((plugin) => plugin !== 'babel-plugin-macros')],
};

console.log(module.exports.plugins);
