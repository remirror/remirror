module.exports = {
  locales: ['en'],
  sourceLocale: 'en',
  format: 'po',
  catalogs: [
    {
      path: '<rootDir>/packages/@remirror/i18n/src/{locale}/messages',
      include: ['<rootDir>/packages/@remirror/*/src'],
      exclude: ['**/node_modules/**'],
    },
  ],
};
