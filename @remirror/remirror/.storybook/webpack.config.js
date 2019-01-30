const path = require('path');

module.exports = (baseConfig, env, config) => {
  config.module.rules.push({
    test: /\.(ts|tsx)$/,
    loader: require.resolve('babel-loader'),
  });

  config.resolve.alias = config.resolve.alias || {};
  config.resolve.alias.react = path.resolve(__dirname, '../../../', './node_modules/react');
  config.externals = { ...(config.externals || {}), fs: '__NOT_USED__' };

  config.resolve.extensions.push('.ts', '.tsx');
  return config;
};
