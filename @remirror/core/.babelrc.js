const defaultConfig = require('../../support/babel/base.babel');

module.exports = {
  ...defaultConfig,
  presets: [
    [
      '@babel/preset-env',
      {
        modules: false,
        targets: {
          node: '8',
        },
      },
    ],
    '@babel/preset-typescript',
    '@babel/preset-react',
  ],
  plugins: [
    // 'babel-plugin-styled-components',
    ...defaultConfig.plugins,
  ],
  env: {
    test: {
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
    },
  },
};
