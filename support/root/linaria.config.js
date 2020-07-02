// This file has been copied from `support/root`.
// TO EDIT update the `support/root` file and run `pnpm run update:root`.

const { kebabCase } = require('case-anything');

/**
 * @type import('linaria/lib/babel/types').StrictOptions
 */
const config = {
  displayName: true,
  classNameSlug: (_hash, title) => {
    return `remirror-${kebabCase(title.replace(/Styles?/g, ''))}`;
  },
  babelOptions: require('./support/babel/base.babel'),
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
