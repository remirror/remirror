const defaultConfig = require('../support/babel/base.babel');
const path = require('path');

module.exports = {
  ...defaultConfig,
  presets: [['babel-preset-docz', {}], '@emotion/babel-preset-css-prop'],
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
          '@remirror/react': '../@remirror/react/src',
          '@remirror/mentions-extension': '../@remirror/mentions-extension/src',
          '@remirror/renderer': '../@remirror/renderer/src',
          '@remirror/remirror': '../@remirror/remirror/src',
        },
        cwd: path.resolve(__dirname),
      },
    ],
  ],
};
