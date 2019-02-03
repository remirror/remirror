const defaultConfig = require('../../support/babel/base.babel');

module.exports = {
  ...defaultConfig,
  presets: [
    '@babel/preset-typescript',
    '@babel/preset-react',
    [
      '@babel/preset-env',
      {
        targets: {
          node: '8',
        },
      },
    ],
  ],
  plugins: [...defaultConfig.plugins],
  env: {
    test: {
      presets: [
        '@babel/preset-typescript',
        '@babel/preset-react',
        [
          '@babel/preset-env',
          {
            targets: {
              node: '8',
            },
          },
        ],
      ],
    },
  },
};
