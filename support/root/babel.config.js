const config = require('../babel/base.babel');

module.exports = {
  ...config,
  babelrcRoots: [
    '.',
    'packages/@remirror/*',
    'packages/*',
    'support/website/.babelrc.js',
    'support/storybook/.babelrc.js',
  ],
  sourceType: 'unambiguous',
};
