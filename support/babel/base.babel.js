const ignore = [
  '**/__tests__',
  '**/__mocks__',
  '**/__fixtures__',
  '*.{test,spec}.{ts,tsx}',
  '**/*.d.ts',
  '*.d.ts',
];

const presets = [
  ['@babel/preset-env', { loose: true }],
  '@babel/preset-typescript',
  '@babel/preset-react',
  '@emotion/babel-preset-css-prop',
];

const testBabelPresetEnv = ['@babel/preset-env', { targets: { node: '8' }, loose: true }];
const nonTestEnv = { ignore, presets };

module.exports = {
  presets: [testBabelPresetEnv, '@babel/preset-typescript', '@babel/preset-react'],
  plugins: [
    // Required for the compilation of abstract classes
    '@babel/plugin-transform-typescript',
    ['@babel/plugin-transform-runtime'],
    ['@babel/plugin-proposal-class-properties', { loose: true }],
    ['@babel/plugin-proposal-object-rest-spread', { loose: true }],
    '@babel/plugin-syntax-dynamic-import',
    'lodash',
  ],
  env: { production: nonTestEnv, development: nonTestEnv },
};
