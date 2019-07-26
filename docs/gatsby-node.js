const { resolve } = require('path');

module.exports = {
  onCreateWebpackConfig({ actions }) {
    actions.setWebpackConfig({
      resolve: {
        modules: [resolve(__dirname, './src'), 'node_modules'],
      },
    });
  },
};
