const ignore = [
  '**/__tests__',
  '**/__mocks__',
  '*.{test,spec}.{ts,tsx}',
  '**/*.d.ts',
  '*.d.ts',
];

const nonTestEnv = { ignore };

module.exports = {
  presets: [
    '@babel/preset-env',
    '@babel/preset-typescript',
    '@emotion/babel-preset-css-prop',
    '@babel/preset-react',
  ],
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
