module.exports = ({ config }) => {
  config.module.rules.push({
    test: /\.(ts|tsx)$/,
    loader: require.resolve('babel-loader'),
    options: require('./.babelrc'),
  });
  config.resolve.extensions.push('.ts', '.tsx');
  return config;
};
