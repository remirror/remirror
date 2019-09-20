const prettier = require('prettier');
const indentString = require('indent-string');

module.exports = {
  test: val => val._ === 'HTML',

  serialize(val, config, _indentation, depth, _refs, _printer) {
    const html = val.html;
    const prettified = prettier.format(html, {
      parser: 'html',
      htmlWhitespaceSensitivity: 'css',
    });

    return indentString(prettified, depth + 1, {
      indent: config.indent,
    }).trim();
  },
};
