const ignore = [
  '**/__tests__',
  '**/__mocks__',
  '**/__fixtures__',
  '*.{test,spec}.{ts,tsx}',
  '**/*.d.ts',
  '*.d.ts',
];

// ? Using `'@emotion/babel-preset-css-prop'` causes jest tests to fail
// ? see https://github.com/emotion-js/emotion/issues/1234#issuecomment-502348554
const basePreset = ['@babel/preset-typescript', '@babel/preset-react'];

const presets = [['@babel/preset-env'], ...basePreset, '@emotion/babel-preset-css-prop'];

const testBabelPresetEnv = ['@babel/preset-env', { targets: { node: '8' } }];
const nonTestEnv = { ignore, presets };

module.exports = {
  presets: [testBabelPresetEnv, ...basePreset],
  plugins: [
    // Required for the compilation of abstract classes
    '@babel/plugin-transform-typescript',
    ['@babel/plugin-transform-runtime'],
    ['@babel/plugin-proposal-class-properties'],
    ['@babel/plugin-proposal-object-rest-spread'],
    '@babel/plugin-syntax-dynamic-import',
    'lodash',
  ],
  env: { production: nonTestEnv, development: nonTestEnv },
};
