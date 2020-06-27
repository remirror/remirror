const babelOptions = require('./support/babel/base.babel');
const { kebabCase } = require('case-anything');

/** @type import('linaria/lib/babel/types').StrictOptions */
const config = {
  displayName: true,
  classNameSlug: (_hash, title) => {
    return `remirror-${kebabCase(title.replace(/Styles?/g, ''))}`;
  },
  babelOptions,
};

module.exports = config;
