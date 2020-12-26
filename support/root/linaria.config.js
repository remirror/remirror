/**
 * @type {import('@linaria/babel').StrictOptions}
 */
const config = {
  displayName: true,
  classNameSlug: (_hash, title) => {
    return `remirror-${title.toLowerCase().split('_').join('-')}`;
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
