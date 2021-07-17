const MonacoEditorWebpackPlugin = require('monaco-editor-webpack-plugin');
const WorkerPlugin = require('worker-plugin');

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
  return {
    name: 'monaco-editor',
    configureWebpack(config, isServer, utils) {
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
            return [require('postcss-import'), require('postcss-nested'), require('autoprefixer')];
          };
        }
      }

      return {
        externals: { jsdom: 'commonjs jsdom', domino: 'commonjs domino' },
        module: {
          rules: [
            { test: /\.ttf$/, use: [require.resolve('file-loader')] },
            // For some reason the empty include array `[]` fixes an issue with
            // the monaco editor being loaded
            { test: /\.css$/, use: [require.resolve('css-loader')], include: [] },
          ],
        },
        resolve: {
          // alias: {
          //   '@linaria/core': '@emotion/css',
          // },
          fallback: {
            fs: false,
          },
        },
        plugins: [
          new MonacoEditorWebpackPlugin({ languages: ['typescript', 'javascript'] }),
          new WorkerPlugin(),
        ],
      };
    },
  };
}

module.exports = monacoEditorPlugin;
