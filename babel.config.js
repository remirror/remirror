module.exports = {
  sourceMaps: true,
  plugins: [
    '@babel/plugin-transform-arrow-functions',
    '@babel/plugin-proposal-class-properties',
    'babel-plugin-styled-components',
    'lodash',
  ],
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
  ],
  babelrcRoots: ['./', './@packages/*'],
};
