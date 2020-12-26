const ignore = [
  '**/__tests__',
  '**/__dts__',
  '**/__mocks__',
  '**/__fixtures__',
  '*.{test,spec}.{ts,tsx}',
  '**/*.d.ts',
  '*.d.ts',
];

const basePreset = [['@babel/preset-react', { runtime: 'automatic' }]];
const presets = [...basePreset, ['@babel/preset-env', { targets: 'since 2017' }, 'deduplicate']];
const testBabelPresetEnv = ['@babel/preset-env', { targets: { node: 'current' } }, 'deduplicate'];
const nonTestEnv = { ignore, presets };

module.exports = {
  presets: [...basePreset, testBabelPresetEnv],
  overrides: [
    { test: /\.ts$/, plugins: [['@babel/plugin-transform-typescript', { isTSX: false }]] },
    { test: /\.tsx$/, plugins: [['@babel/plugin-transform-typescript', { isTSX: true }]] },
    {
      test: /\.[jt]sx?$/,
      plugins: [
        ['@babel/plugin-proposal-class-properties'],
        ['@babel/plugin-proposal-private-methods'],
      ],
    },
  ],
  plugins: [
    'babel-plugin-macros',
    [
      '@babel/plugin-transform-runtime',
      { version: require('../package.json').dependencies['@babel/runtime'] },
      'deduplicate',
    ],
    ['@babel/plugin-transform-template-literals', {}, 'deduplicate'],
    '@babel/plugin-proposal-object-rest-spread',
    '@babel/plugin-syntax-dynamic-import',
    '@babel/plugin-proposal-nullish-coalescing-operator',
    '@babel/plugin-proposal-optional-chaining',
    '@babel/plugin-proposal-numeric-separator',
    '@babel/plugin-proposal-logical-assignment-operators',
    ['@babel/plugin-proposal-decorators', { legacy: true }],
    'babel-plugin-annotate-pure-calls',
    'babel-plugin-dev-expression',
  ],
  env: { production: nonTestEnv, development: nonTestEnv },
};
