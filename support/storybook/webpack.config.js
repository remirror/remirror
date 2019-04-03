module.exports = ({ config, mode }) => {
  config.module.rules.push({
    test: /\.(ts|tsx)$/,
    loader: require.resolve('babel-loader'),
    options: require('../../docs/.babelrc'),
  });
  config.resolve.extensions.push('.ts', '.tsx');
  return config;
};
