const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');

module.exports = ({ config }) => {
  config.module.rules.push({
    test: /\.(ts|tsx)$/,
    loader: require.resolve('babel-loader'),
    options: require('./.babelrc'),
  });
  config.resolve.extensions.push('.ts', '.tsx');
  config.plugins.push(
    new MonacoWebpackPlugin({
      languages: ['typescript', 'javascript'],
    }),
  );
  return config;
};
