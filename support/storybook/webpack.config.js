const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');

module.exports = ({ config }) => {
  config.resolve.extensions.push('.ts', '.tsx');

  config.plugins.push(
    new MonacoWebpackPlugin({
      languages: ['typescript', 'javascript'],
    }),
  );

  return config;
};
