const { SKIP_STORIES } = process.env;

const ignore = [
  '**/__tests__',
  '**/__mocks__',
  '**/__fixtures__',
  ...(SKIP_STORIES ? ['**/__stories__'] : []),
  '*.{test,spec}.{ts,tsx}',
  '**/*.d.ts',
  '*.d.ts',
];

const basePreset = ['@babel/preset-react'];

const presets = [...basePreset, ['@babel/preset-env']];

const testBabelPresetEnv = ['@babel/preset-env', { targets: { node: '8' } }];
const nonTestEnv = { ignore, presets };

module.exports = {
  presets: [...basePreset, testBabelPresetEnv],
  overrides: [
    { test: /\.ts$/, plugins: [['@babel/plugin-transform-typescript', { isTSX: false }]] },
    { test: /\.tsx$/, plugins: [['@babel/plugin-transform-typescript', { isTSX: true }]] },
    {
      test: /\.tsx?$/,
      plugins: [
        '@babel/plugin-proposal-class-properties',
        '@babel/plugin-proposal-private-methods',
      ],
    },
  ],
  plugins: [
    'babel-plugin-annotate-pure-calls',
    'babel-plugin-dev-expression',
    'babel-plugin-transform-async-to-promises',
    '@babel/plugin-transform-runtime',
    '@babel/plugin-proposal-object-rest-spread',
    '@babel/plugin-syntax-dynamic-import',
    '@babel/plugin-proposal-nullish-coalescing-operator',
    '@babel/plugin-proposal-optional-chaining',
  ],
  env: { production: nonTestEnv, development: nonTestEnv },
};
