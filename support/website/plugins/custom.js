/**
 * @typedef {import('@docusaurus/types').LoadContext} Context
 * @typedef {import('@docusaurus/types').Plugin} DocPlugin
 */

/**
 * A custom plugin to enable compilation of in-repo packages.
 *
 * @param {Context} context - The plugin context
 * @param {{}} options - The plugin specific options.
 * @returns {DocPlugin}
 */
function customPlugin() {
  // ...
  return {
    name: 'custom',
    configureWebpack(config) {
      /**
       * @type import('webpack').RuleSetCondition
       */
      let previousRule;

      for (const rule of config.module.rules) {
        if (String(rule.test) === String(/\.(j|t)sx?$/)) {
          previousRule = rule.exclude;
        }
      }

      return {
        module: {
          rules: [
            {
              test: /\.(j|t)sx?$/,
              exclude: (modulePath) => {
                const previousExclude = previousRule?.(modulePath);

                if (!previousExclude) {
                  return previousExclude;
                }

                const exclude =
                  /node_modules/.test(modulePath) && !/node_modules\/(@?remirror)/.test(modulePath);

                if (!exclude) {
                  console.log(modulePath);
                }

                return exclude;
              },
              use: [require.resolve('babel-loader')],
            },
          ],
        },
      };
    },
  };
}

module.exports = customPlugin;
