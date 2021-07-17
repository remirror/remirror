const config = require('../base.babel');

module.exports = {
  ...config,
  babelrcRoots: [
    '.',
    'packages/remirror__*',
    'packages/*',
    'website/.babelrc.js',
    'support/storybook/.babelrc.js',
  ],
  sourceType: 'unambiguous',
};
