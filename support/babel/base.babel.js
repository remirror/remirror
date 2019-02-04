module.exports = {
  presets: [
    '@babel/preset-typescript',
    [
      '@babel/preset-env',
      {
        targets: {
          node: '8',
        },
      },
    ],
    '@babel/preset-react',
  ],
  plugins: [
    '@babel/plugin-transform-typescript', // This is need so that abstract classes are properly compiled
    '@babel/plugin-proposal-class-properties',
    '@babel/plugin-proposal-object-rest-spread',
    '@babel/plugin-syntax-dynamic-import',
    'lodash',
  ],
  env: {
    production: {
      ignore: [
        '**/__tests__',
        '**/__mocks__',
        '**/__stories__',
        '*.{test,spec,stories}.{ts,tsx}',
        '**/*.d.ts',
        '*.d.ts',
      ],
    },
    development: {
      ignore: [
        '**/__tests__',
        '**/__mocks__',
        '**/__stories__',
        '*.{test,spec,stories}.{ts,tsx}',
        '**/*.d.ts',
        '*.d.ts',
      ],
    },
  },
};
