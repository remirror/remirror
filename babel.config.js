const config = require('./support/base.babel');

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
