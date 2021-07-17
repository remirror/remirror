/** @type {import('prettier').Options} */
const config = {
  bracketSpacing: true,
  endOfLine: 'lf',
  jsxBracketSameLine: false,
  jsxSingleQuote: true,
  plugins: [require.resolve('prettier-plugin-packagejson')],
  printWidth: 100,
  proseWrap: 'never',
  semi: true,
  singleQuote: true,
  tabWidth: 2,
  trailingComma: 'all',
  useTabs: false,
};

module.exports = config;
