/**
 * @type {import('@linaria/babel-preset').StrictOptions}
 */
const config = {
  evaluate: true,
  displayName: true,
  classNameSlug: (_hash, title) => {
    return `${title.startsWith('$') ? '' : 'remirror-'}${title.toLowerCase().split('_').join('-')}`;
  },
  babelOptions: require('../base.babel'),
  rules: [
    {
      action: require('@linaria/shaker').default,
    },
    {
      action: 'ignore',
      test: (modulePath) => {
        return /node_modules/.test(modulePath) && !/node_modules\/(@?remirror)/.test(modulePath);
      },
    },
  ],
};

module.exports = config;
