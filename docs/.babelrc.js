const defaultConfig = require('../support/babel/base.babel');
const path = require('path');

module.exports = {
  ...defaultConfig,
  presets: [['babel-preset-docz'], '@emotion/babel-preset-css-prop'],
  plugins: [
    '@babel/plugin-transform-typescript',
    '@babel/plugin-proposal-class-properties',
    '@babel/plugin-proposal-object-rest-spread',
    '@babel/plugin-syntax-dynamic-import',
    'lodash',
    [
      'module-resolver',
      {
        alias: {
          '@remirror/core': '../@remirror/core/src',
          '@remirror/core-extensions': '../@remirror/core-extensions/src',
          '@remirror/extension-emoji': '../@remirror/extension-emoji/src',
          '@remirror/extension-enhanced-link': '../@remirror/extension-enhanced-link/src',
          '@remirror/extension-mention': '../@remirror/extension-mention/src',
          '@remirror/react': '../@remirror/react/src',
          '@remirror/renderer-react': '../@remirror/renderer-react/src',
          '@remirror/ui-twitter': '../@remirror/ui-twitter/src',
          '@remirror/remirror': '../@remirror/remirror/src',
          '@root': '../',
        },
        cwd: path.resolve(__dirname),
      },
    ],
  ],
};
