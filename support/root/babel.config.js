const config = require('../base.babel');

module.exports = {
  ...config,
  babelrcRoots: [
    '.',
    'packages/remirror__*',
    'packages/*',
    'support/website/.babelrc.js',
    'support/storybook/.babelrc.js',
  ],
  sourceType: 'unambiguous',
};
