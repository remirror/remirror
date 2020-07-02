const MonacoEditorWebpackPlugin = require('monaco-editor-webpack-plugin');

/**
 * @typedef {import('@docusaurus/types').LoadContext} Context
 * @typedef {import('@docusaurus/types').Plugin} DocPlugin
 */

/**
 * A monaco editor plugin to enable webpack configuration for the monaco editor.
 *
 * @param {Context} context - The plugin context
 * @param {{}} options - The plugin specific options.
 * @returns {DocPlugin}
 */
function monacoEditorPlugin(_context, _options) {
  // ...
  return {
    name: 'monaco-editor',
    configureWebpack(config) {
      for (const rule of config.module.rules) {
        if (
          String(rule.test) !== String(/\.css$/) &&
          String(rule.test) !== String(/\.module\.css$/)
        ) {
          continue;
        }

        for (const item of rule.use ?? []) {
          if (!item.loader?.includes('postcss-loader')) {
            continue;
          }

          const postCssPlugins = item.options?.plugins;

          if (!postCssPlugins) {
            continue;
          }

          item.options.plugins = () => {
            return [require('precss'), require('autoprefixer')];
          };
        }
      }

      return {
        resolve: {
          alias: {
            // NOTE: This fixes an issue with `react-live` - remove once this PR
            // is merged https://github.com/FormidableLabs/react-live/pull/193
            'core-js/fn/object/assign': require.resolve('core-js/features/object/assign'),
          },
        },
        module: {
          rules: [
            {
              test: /\.ttf$/,
              use: [require.resolve('file-loader')],
            },
            {
              test: /\.css$/,
              use: [require.resolve('css-loader')],
              // For some reason this fixes an issue with the monaco editor
              // being loaded
              include: [],
            },
          ],
        },
        plugins: [new MonacoEditorWebpackPlugin({ languages: ['typescript', 'javascript'] })],
      };
    },
  };
}

module.exports = monacoEditorPlugin;
