const { kebabCase } = require('case-anything');

/**
 * @type import('linaria/lib/babel/types').StrictOptions
 */
const config = {
  displayName: true,
  classNameSlug: (_hash, title) => {
    return `remirror-${kebabCase(title.replace(/(?:Styles?|Component)$/g, ''))}`;
  },
  babelOptions: require('../base.babel'),
  rules: [
    {
      action: require('linaria/evaluators').shaker,
    },
    {
      action: 'ignore',
      test: (modulePath) =>
        /node_modules/.test(modulePath) && !/node_modules\/(@?remirror)/.test(modulePath),
    },
  ],
};

module.exports = config;
