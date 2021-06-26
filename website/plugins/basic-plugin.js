/**
 * @typedef {import('@docusaurus/types').LoadContext} Context
 * @typedef {import('@docusaurus/types').Plugin} DocPlugin
 */

/**
 * @param {Context} context - The plugin context
 * @param {{}} options - The plugin specific options.
 * @returns {DocPlugin}
 */
function basicPlugin(_context, _options) {
  return {
    name: 'basic-plugin',
    configurePostCss(options) {
      options.plugins.push(
        require('postcss-import'),
        require('postcss-nested'),
        require('autoprefixer'),
      );

      return options;
    },
    configureWebpack(config, isServer, utils) {
      return {
        externals: { jsdom: 'commonjs jsdom', domino: 'commonjs domino' },
      };
    },
  };
}

module.exports = basicPlugin;
