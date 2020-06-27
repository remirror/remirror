const babelOptions = process.env.NODE_ENV === 'test' ? require('./babel.config') : undefined;
const { kebabCase } = require('case-anything');

/**
 * @type import('linaria/lib/babel/types').StrictOptions
 */
const config = {
  displayName: true,
  classNameSlug: (_hash, title) => {
    return `remirror-${kebabCase(title.replace(/Styles?/g, ''))}`;
  },
  babelOptions,
};

module.exports = config;
