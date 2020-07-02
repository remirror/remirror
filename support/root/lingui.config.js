// This file has been copied from `support/root`.
// TO EDIT update the `support/root` file and run `pnpm run update:root`.

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
