module.exports = {
  locales: ['en'],
  sourceLocale: 'en',
  format: 'po',
  catalogs: [
    {
      path: '<rootDir>/@remirror/i18n/src/{locale}/messages',
      include: ['<rootDir>/@remirror/*/src'],
      exclude: ['**/node_modules/**'],
    },
  ],
};
