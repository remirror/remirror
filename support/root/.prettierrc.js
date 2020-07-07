module.exports = {
  bracketSpacing: true,
  endOfLine: 'lf',
  jsxBracketSameLine: false,
  jsxSingleQuote: true,
  plugins: [require.resolve('prettier-plugin-packagejson')],
  printWidth: 100,
  proseWrap: 'always',
  semi: true,
  singleQuote: true,
  tabWidth: 2,
  trailingComma: 'all',
  useTabs: false,
  overrides: [
    {
      files: ['.github/**/*.md', '.changeset/**/*.md'],
      options: {
        proseWrap: 'never',
      },
    },
  ],
};
