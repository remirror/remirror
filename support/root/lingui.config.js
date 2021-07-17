const path = require('path');

const rootDir = path.resolve(__dirname, '../../');

module.exports = {
  locales: ['en'],
  sourceLocale: 'en',
  format: 'po',
  rootDir,
  extractBabelOptions: {
    rootMode: 'upward',
  },
  catalogs: [
    {
      path: '<rootDir>/packages/remirror__i18n/src/{locale}/messages',
      include: ['<rootDir>/packages/remirror__messages/src/*.ts'],
      exclude: ['**/node_modules/**'],
    },
  ],
  compileNamespace: 'ts',
};
