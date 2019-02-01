module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          node: '8',
        },
      },
    ],
    '@babel/preset-typescript',
    '@babel/preset-react',
  ],
  plugins: [
    '@babel/plugin-proposal-class-properties',
    '@babel/plugin-proposal-object-rest-spread',
    '@babel/plugin-syntax-dynamic-import',
    'lodash',
  ],
  env: {
    test: {
      ignore: [],
    },
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
