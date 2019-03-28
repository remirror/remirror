const ignore = [
  '**/__tests__',
  '**/__mocks__',
  '*.{test,spec}.{ts,tsx}',
  '**/*.d.ts',
  '*.d.ts',
];

const presets = [
  '@babel/preset-env',
  '@babel/preset-typescript',
  '@babel/preset-react',
  '@emotion/babel-preset-css-prop',
];

const nonTestEnv = { ignore, presets };

module.exports = {
  presets: ['@babel/preset-env', '@babel/preset-typescript', '@babel/preset-react'],
  plugins: [
    '@babel/plugin-transform-typescript', // This is needed so that abstract classes are properly compiled
    ['@babel/plugin-transform-runtime', { corejs: 2 }],
    '@babel/plugin-proposal-class-properties',
    '@babel/plugin-proposal-object-rest-spread',
    '@babel/plugin-syntax-dynamic-import',
    'lodash',
  ],
  env: { production: nonTestEnv, development: nonTestEnv },
};
